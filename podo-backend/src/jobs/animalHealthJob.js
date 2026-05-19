const cron = require("node-cron");

function startAnimalHealthJob(pool) {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();

      // Get all alive animals
      const result = await pool.query(
        "SELECT * FROM animals WHERE status != 'gone'"
      );

      for (const animal of result.rows) {
        const lastFed = new Date(animal.last_fed_at);
        const hoursElapsed = (now - lastFed) / (1000 * 60 * 60);

        let newStatus = null;

        if (hoursElapsed > 96) {
          newStatus = "gone";
        } else if (hoursElapsed > 72) {
          newStatus = "critical";
        } else if (hoursElapsed > 48) {
          newStatus = "sick";
        } else if (hoursElapsed > 24) {
          newStatus = "normal";
        }

        if (newStatus && newStatus !== animal.status) {
          await pool.query("UPDATE animals SET status = $1 WHERE id = $2", [
            newStatus,
            animal.id,
          ]);

          // If gone, insert into memorial
          if (newStatus === "gone") {
            await pool.query(
              `INSERT INTO memorial_animals (user_id, animal_name, animal_status_at_death, gone_at)
               VALUES ($1, $2, $3, NOW())`,
              [animal.user_id, animal.name, animal.status]
            );
          }
        }
      }
    } catch (err) {
      // Silently handle cron errors
    }
  });
}

module.exports = startAnimalHealthJob;
