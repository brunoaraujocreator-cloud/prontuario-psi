import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const groups = await supabaseService.getAll('groups', req.user.id);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const group = await supabaseService.getById('groups', req.params.id, req.user.id);
    res.json(group);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const group = await supabaseService.create('groups', req.body, req.user.id);
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const group = await supabaseService.update('groups', req.params.id, req.body, req.user.id);
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await supabaseService.delete('groups', req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

