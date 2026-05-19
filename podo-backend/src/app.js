require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const pool = require("./db/pool");

const authMiddleware = require("./middleware/authMiddleware");
const authController = require("./controllers/authController");
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
const auth = authController(pool);
const tasks = taskController(pool);
const quiz = quizController(pool);

// --- Routes ---

// Auth (no middleware)
app.post("/api/auth/register", auth.register);
app.post("/api/auth/login", auth.login);

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
