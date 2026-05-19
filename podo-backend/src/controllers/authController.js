const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function authController(pool) {
  async function register(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email ve şifre gerekli" });
      }

      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "Bu email zaten kayıtlı" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, coin_balance, created_at`,
        [email, passwordHash]
      );

      const user = result.rows[0];

      // Create a default animal for the new user
      await pool.query(
        `INSERT INTO animals (user_id, name) VALUES ($1, $2)`,
        [user.id, "Kuşum"]
      );

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(201).json({ token, user });
    } catch (err) {
      console.error('REGISTER ERROR:', err);
      return res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
    }
  }

  async function login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email ve şifre gerekli" });
      }

      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: "Geçersiz email veya şifre" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          coin_balance: user.coin_balance,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: "Giriş sırasında hata oluştu" });
    }
  }

  return { register, login };
}

module.exports = authController;
