require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const pool = require("./db/pool");

const authMiddleware = require("./middleware/authMiddleware");

const taskController = require("./controllers/taskController");
const quizController = require("./controllers/quizController");
const animalService = require("./services/animalService");
const startAnimalHealthJob = require("./jobs/animalHealthJob");

// Database pool imported from ./db/pool

// Express
const app = express();
app.use(cors());
app.use(express.json());

// Multer — PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Yalnızca PDF dosyaları kabul edilir"), false);
    }
  },
});

// Controllers

const tasks = taskController(pool);
const quiz = quizController(pool);

// --- Routes ---


// Tasks (JWT required)
app.post("/api/tasks", authMiddleware, upload.single("pdf"), tasks.createTask);
app.get("/api/tasks", authMiddleware, tasks.getTasks);
app.patch("/api/tasks/:id/complete", authMiddleware, tasks.completeTask);

// Quiz (JWT required)
app.post("/api/quiz/:taskId/submit", authMiddleware, quiz.submitQuiz);

// Animal (JWT required)
app.get("/api/animal", authMiddleware, async (req, res) => {
  try {
    const data = await animalService.getAnimal(req.userId);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: "Hayvan bilgisi alınırken hata oluştu" });
  }
});

app.post("/api/animal/feed", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query("SELECT coin_balance FROM users WHERE id = $1", [req.userId]);
    if (user.rows[0].coin_balance <= 0) {
      return res.status(400).json({ error: "Yeterli kemik yok" });
    }
    
    const animalCheck = await pool.query("SELECT * FROM animals WHERE user_id = $1 AND status != 'gone' LIMIT 1", [req.userId]);
    if (animalCheck.rows.length === 0) return res.status(404).json({ error: "Hayvan bulunamadı" });
    const animal = animalCheck.rows[0];
    
    if (animal.status === 'happy') {
      return res.status(400).json({ error: "Podo zaten çok mutlu! Daha fazla yiyemez." });
    }
    
    let newStatus = 'happy';
    if (animal.status === 'critical') newStatus = 'sick';
    else if (animal.status === 'sick') newStatus = 'normal';
    else if (animal.status === 'normal') newStatus = 'happy';
    
    await pool.query("UPDATE users SET coin_balance = coin_balance - 1 WHERE id = $1", [req.userId]);
    await pool.query("UPDATE animals SET status = $1 WHERE id = $2", [newStatus, animal.id]);
    
    res.json({ success: true, status: newStatus, bonesRemaining: user.rows[0].coin_balance - 1 });
  } catch (err) {
    res.status(500).json({ error: "Besleme hatası" });
  }
});

app.put("/api/animal/name", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    await pool.query("UPDATE animals SET name = $1 WHERE user_id = $2 AND status != 'gone'", [name, req.userId]);
    res.json({ success: true, name });
  } catch (err) {
    res.status(500).json({ error: "İsim güncellenirken hata oluştu" });
  }
});

// Start cron job
startAnimalHealthJob(pool);

// Ensure uploads directory exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Podo API running on port ${PORT}`);
});
