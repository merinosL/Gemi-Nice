const pool = require("../db/pool");

async function feed(userId) {
  const result = await pool.query(
    `UPDATE animals SET last_fed_at = NOW(), status = 'happy'
     WHERE user_id = $1 AND status != 'gone'
     RETURNING *`,
    [userId]
  );
  return result.rows[0] || null;
}

async function getAnimal(userId) {
  const animalResult = await pool.query(
    `SELECT * FROM animals WHERE user_id = $1 AND status != 'gone' LIMIT 1`,
    [userId]
  );
  const memorialResult = await pool.query(
    `SELECT * FROM memorial_animals WHERE user_id = $1 ORDER BY gone_at DESC`,
    [userId]
  );
  return {
    animal: animalResult.rows[0] || null,
    memorial: memorialResult.rows,
  };
}

async function createAnimal(userId, name) {
  const result = await pool.query(
    `INSERT INTO animals (user_id, name) VALUES ($1, $2) RETURNING *`,
    [userId, name]
  );
  return result.rows[0];
}

module.exports = { feed, getAnimal, createAnimal };
