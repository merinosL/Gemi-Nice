const pool = require("../db/pool");

async function authMiddleware(req, res, next) {
  try {
    // HACKATHON DEMO MODE: Auto-login as first user, create one if none exists.
    let { rows } = await pool.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");

    let userId;

    if (rows.length === 0) {
      // Create demo user
      const insertRes = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
        ["demo@podo.com", "hackathon_demo"]
      );
      userId = insertRes.rows[0].id;

      // Create a default animal for the demo user so the pet system works
      await pool.query(
        "INSERT INTO animals (user_id, name, status) VALUES ($1, $2, $3)",
        [userId, "Podo", "happy"]
      );
    } else {
      userId = rows[0].id;

      // Ensure this user has an active animal — create one if not
      const animalCheck = await pool.query(
        "SELECT id FROM animals WHERE user_id = $1 AND status != 'gone' LIMIT 1",
        [userId]
      );
      if (animalCheck.rows.length === 0) {
        await pool.query(
          "INSERT INTO animals (user_id, name, status) VALUES ($1, $2, $3)",
          [userId, "Podo", "happy"]
        );
      }
    }

    req.userId = userId;
    next();
  } catch (err) {
    console.error("Auth bypass error:", err);
    return res.status(500).json({ error: "Auth error" });
  }
}

module.exports = authMiddleware;