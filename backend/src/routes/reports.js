import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const reports = await supabaseService.getAll('reports', req.user.id);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const report = await supabaseService.create('reports', req.body, req.user.id);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;



