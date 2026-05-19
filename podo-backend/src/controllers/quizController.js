const animalService = require("../services/animalService");

const COIN_MAP = { easy: 1, normal: 2, hard: 3 };

function quizController(pool) {
  async function submitQuiz(req, res) {
    try {
      const { taskId } = req.params;
      const { answers } = req.body;
      const userId = req.userId;

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res
          .status(400)
          .json({ error: "Cevaplar boş olamaz" });
      }

      const taskResult = await pool.query(
        "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
        [taskId, userId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: "Görev bulunamadı" });
      }

      const task = taskResult.rows[0];
      const questions = task.questions;

      const total = questions.length || 10;
      // Compare answers
      let correct = 0;
      for (let i = 0; i < total; i++) {
        if (
          answers[i] &&
          questions[i] &&
          answers[i].trim().toLowerCase() ===
            questions[i].answer.trim().toLowerCase()
        ) {
          correct++;
        }
      }

      const score = (correct / total) * 100;
      const passed = score >= 70;
      let coinsEarned = 0;
      let animalStatus = null;

      if (passed) {
        coinsEarned = COIN_MAP[task.difficulty] || 1;

        await pool.query(
          "UPDATE users SET coin_balance = coin_balance + $1 WHERE id = $2",
          [coinsEarned, userId]
        );

        // Görevi tamamlandı olarak işaretle
        await pool.query("UPDATE tasks SET completed_at = NOW() WHERE id = $1", [taskId]);

        const currentAnimalRes = await pool.query(
          "SELECT status FROM animals WHERE user_id = $1 AND status != 'gone' LIMIT 1",
          [userId]
        );
        animalStatus = currentAnimalRes.rows.length > 0 ? currentAnimalRes.rows[0].status : null;
      } else {
        // HACKATHON DEMO: Başarısızlık durumunda hayvanı cezalandırıp durumunu düşür (Jüri görsün diye)
        const currentAnimalRes = await pool.query(
          "SELECT * FROM animals WHERE user_id = $1 AND status != 'gone' LIMIT 1",
          [userId]
        );
        
        if (currentAnimalRes.rows.length > 0) {
          const animal = currentAnimalRes.rows[0];
          let newStatus = animal.status;
          
          if (animal.status === 'happy') newStatus = 'normal';
          else if (animal.status === 'normal') newStatus = 'sick';
          else if (animal.status === 'sick') newStatus = 'critical';
          // HACKATHON DEMO: 'critical' durumundan 'gone' durumuna quiz başarısızlığıyla geçmesini engelledik.
          // Çünkü 'gone' (ölü) olursa, authMiddleware otomatik olarak yeni bir 'happy' (mutlu) hayvan yaratıp başa sarıyor.
          // Sınavdan sürekli kalsa bile 'critical' olarak kalsın.

          if (newStatus !== animal.status) {
            await pool.query(
              "UPDATE animals SET status = $1 WHERE id = $2",
              [newStatus, animal.id]
            );
            animalStatus = newStatus;
          } else {
            animalStatus = animal.status;
          }
        }
      }

      return res.json({ score, passed, bonesEarned: coinsEarned, animalStatus });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Quiz gönderilirken hata oluştu" });
    }
  }

  return { submitQuiz };
}

module.exports = quizController;
