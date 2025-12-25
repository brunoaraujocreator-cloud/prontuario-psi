import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const sessions = await supabaseService.getAll('sessions', req.user.id);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const session = await supabaseService.getById('sessions', req.params.id, req.user.id);
    res.json(session);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const session = await supabaseService.create('sessions', req.body, req.user.id);
    
    // Log action
    await supabaseService.create('recent_actions', {
      type: 'create',
      entity_type: 'session',
      entity_id: session.id,
      entity_name: `Sessão ${session.date}`,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const session = await supabaseService.update('sessions', req.params.id, req.body, req.user.id);
    
    // Log action
    await supabaseService.create('recent_actions', {
      type: 'edit',
      entity_type: 'session',
      entity_id: session.id,
      entity_name: `Sessão ${session.date}`,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const session = await supabaseService.getById('sessions', req.params.id, req.user.id);
    if (session) {
      // 1. Move to trash
      await supabaseService.create('trash', {
        entity_type: 'session',
        entity_id: session.id,
        entity_data: session,
        deleted_at: new Date().toISOString()
      }, req.user.id);

      // 2. Delete
      await supabaseService.delete('sessions', req.params.id, req.user.id);

      // 3. Log action
      await supabaseService.create('recent_actions', {
        type: 'delete',
        entity_type: 'session',
        entity_id: session.id,
        entity_name: `Sessão ${session.date}`,
        timestamp: new Date().toISOString()
      }, req.user.id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;



