import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const events = await supabaseService.getAll('events', req.user.id);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await supabaseService.getById('events', req.params.id, req.user.id);
    res.json(event);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const event = await supabaseService.create('events', req.body, req.user.id);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await supabaseService.update('events', req.params.id, req.body, req.user.id);
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await supabaseService.delete('events', req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

