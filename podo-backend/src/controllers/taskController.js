const pdfService = require("../services/pdfService");
const geminiService = require("../services/geminiService");

function taskController(pool) {
  async function createTask(req, res) {
    try {
      const { title, deadline } = req.body;
      const userId = req.userId;

      if (!title || !deadline) {
        return res.status(400).json({ error: "Başlık ve son tarih gerekli" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "PDF dosyası gerekli" });
      }

      const pdfPath = req.file.path;
      const pdfText = await pdfService.extractText(pdfPath);
      const analysis = await geminiService.analyzeDocument(pdfText);

      const result = await pool.query(
        `INSERT INTO tasks (user_id, title, description, difficulty, pdf_path, questions, deadline)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          title,
          analysis.description,
          analysis.difficulty,
          pdfPath,
          JSON.stringify(analysis.questions),
          deadline,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: "Görev oluşturulurken hata oluştu" });
    }
  }

  async function getTasks(req, res) {
    try {
      const userId = req.userId;
      const result = await pool.query(
        `SELECT * FROM tasks WHERE user_id = $1
         ORDER BY completed_at IS NOT NULL, deadline ASC`,
        [userId]
      );
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: "Görevler getirilirken hata oluştu" });
    }
  }

  async function completeTask(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const result = await pool.query(
        `UPDATE tasks SET completed_at = NOW()
         WHERE id = $1 AND user_id = $2 AND completed_at IS NULL
         RETURNING *`,
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Görev bulunamadı veya zaten tamamlanmış" });
      }

      return res.json(result.rows[0]);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Görev tamamlanırken hata oluştu" });
    }
  }

  return { createTask, getTasks, completeTask };
}

module.exports = taskController;
