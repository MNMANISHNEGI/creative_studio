const express     = require('express');
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/* GET /api/explore
   Returns all generations for this user with project name, sorted newest first.
   Supports ?type=copywriting|social|banner&limit=20&offset=0 */
router.get('/', async (req, res) => {
  const { type, limit = 50, offset = 0 } = req.query;

  const conditions = ['g.user_id = $1'];
  const params     = [req.user.id];

  if (type) {
    params.push(type);
    conditions.push(`g.tab_type = $${params.length}`);
  }

  params.push(parseInt(limit));
  params.push(parseInt(offset));

  try {
    const { rows } = await pool.query(
      `SELECT
         g.*,
         p.name  AS project_name,
         p.color_idx
       FROM   generations g
       JOIN   projects p ON p.id = g.project_id
       WHERE  ${conditions.join(' AND ')}
       ORDER  BY g.created_at DESC
       LIMIT  $${params.length - 1}
       OFFSET $${params.length}`,
      params
    );

    /* Stats */
    const { rows: stats } = await pool.query(
      `SELECT
         COUNT(*)::int                                        AS total,
         COUNT(*) FILTER (WHERE tab_type='copywriting')::int AS copy_count,
         COUNT(*) FILTER (WHERE tab_type='social')::int      AS social_count,
         COUNT(*) FILTER (WHERE tab_type='banner')::int      AS banner_count
       FROM generations WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ items: rows, stats: stats[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
