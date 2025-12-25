import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

// Get recent actions
router.get('/recent-actions', async (req, res) => {
  try {
    const actions = await supabaseService.getAll('recent_actions', req.user.id);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get change history for an entity
router.get('/changes/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { data, error } = await supabaseService.supabase
      .from('change_history')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

