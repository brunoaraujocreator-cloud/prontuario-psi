import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService, supabase } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

// Get trash items
router.get('/', async (req, res) => {
  try {
    const trash = await supabaseService.getAll('trash', req.user.id);
    res.json(trash);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore item from trash
router.post('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get trash item
    const trashItem = await supabaseService.getById('trash', id, req.user.id);
    if (!trashItem) return res.status(404).json({ error: 'Item not found in trash' });

    // 2. Insert back into original table
    const table = getTableName(trashItem.entity_type);
    const { error: insertError } = await supabase
      .from(table)
      .insert(trashItem.entity_data);
    
    if (insertError) throw insertError;

    // 3. Delete from trash
    await supabaseService.delete('trash', id, req.user.id);

    // 4. Log action
    await supabaseService.create('recent_actions', {
      type: 'restore',
      entity_type: trashItem.entity_type,
      entity_id: trashItem.entity_id,
      entity_name: trashItem.entity_data.name || trashItem.entity_data.description || trashItem.entity_data.title,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to get table name from entity type
function getTableName(entityType) {
  const mapping = {
    'patient': 'patients',
    'session': 'sessions',
    'report': 'reports',
    'expense': 'expenses',
    'demonstrative': 'demonstratives',
    'event': 'events',
    'group': 'groups'
  };
  return mapping[entityType] || entityType;
}

export default router;

