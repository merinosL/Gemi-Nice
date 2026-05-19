const animalService = require("../services/animalService");

const COIN_MAP = { easy: 1, normal: 2, hard: 3 };

function quizController(pool) {
  async function submitQuiz(req, res) {
    try {
      const { taskId } = req.params;
      const { answers } = req.body;
      const userId = req.userId;

      if (!answers || !Array.isArray(answers) || answers.length !== 10) {
        return res
          .status(400)
          .json({ error: "Tam olarak 10 cevap gönderilmeli" });
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

      // Compare answers
      let correct = 0;
      for (let i = 0; i < 10; i++) {
        if (
          answers[i] &&
          questions[i] &&
          answers[i].trim().toLowerCase() ===
            questions[i].answer.trim().toLowerCase()
        ) {
          correct++;
        }
      }

      const score = (correct / 10) * 100;
      const passed = score >= 70;
      let coinsEarned = 0;
      let animalStatus = null;

      if (passed) {
        coinsEarned = COIN_MAP[task.difficulty] || 1;

        await pool.query(
          "UPDATE users SET coin_balance = coin_balance + $1 WHERE id = $2",
          [coinsEarned, userId]
        );

        const fedAnimal = await animalService.feed(userId);
        animalStatus = fedAnimal ? fedAnimal.status : null;
      }

      return res.json({ score, passed, coinsEarned, animalStatus });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Quiz gönderilirken hata oluştu" });
    }
  }

  return { submitQuiz };
}

module.exports = quizController;
