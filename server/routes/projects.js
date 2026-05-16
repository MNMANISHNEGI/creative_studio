const express     = require('express');
const pool        = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

/* GET /api/projects */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
              COUNT(g.id)::int AS generation_count
       FROM   projects p
       LEFT JOIN generations g ON g.project_id = p.id
       WHERE  p.user_id = $1
       GROUP  BY p.id
       ORDER  BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* POST /api/projects */
router.post('/', async (req, res) => {
  const { name, description, color_idx } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Project name is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO projects (user_id, name, description, color_idx)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name.trim(), description?.trim() || '', color_idx ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* GET /api/projects/:id */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/* DELETE /api/projects/:id */
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
