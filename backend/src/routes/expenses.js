import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const expenses = await supabaseService.getAll('expenses', req.user.id);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const expense = await supabaseService.create('expenses', req.body, req.user.id);
    
    // Log action
    await supabaseService.create('recent_actions', {
      type: 'create',
      entity_type: 'expense',
      entity_id: expense.id,
      entity_name: expense.description,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expense = await supabaseService.update('expenses', req.params.id, req.body, req.user.id);
    
    // Log action
    await supabaseService.create('recent_actions', {
      type: 'edit',
      entity_type: 'expense',
      entity_id: expense.id,
      entity_name: expense.description,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await supabaseService.getById('expenses', req.params.id, req.user.id);
    if (expense) {
      // 1. Move to trash
      await supabaseService.create('trash', {
        entity_type: 'expense',
        entity_id: expense.id,
        entity_data: expense,
        deleted_at: new Date().toISOString()
      }, req.user.id);

      // 2. Delete
      await supabaseService.delete('expenses', req.params.id, req.user.id);

      // 3. Log action
      await supabaseService.create('recent_actions', {
        type: 'delete',
        entity_type: 'expense',
        entity_id: expense.id,
        entity_name: expense.description,
        timestamp: new Date().toISOString()
      }, req.user.id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;



