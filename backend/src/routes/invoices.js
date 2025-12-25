import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const invoices = await supabaseService.getAll('invoices', req.user.id);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const invoice = await supabaseService.create('invoices', req.body, req.user.id);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const invoice = await supabaseService.update('invoices', req.params.id, req.body, req.user.id);
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await supabaseService.delete('invoices', req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;



