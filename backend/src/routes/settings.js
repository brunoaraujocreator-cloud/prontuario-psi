import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

router.use(authenticateToken);

// Get settings - using key-value structure
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseService.supabase
      .from('settings')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // Convert key-value pairs to object
    const settings = {};
    if (data && data.length > 0) {
      data.forEach(item => {
        settings[item.key] = item.value;
      });
    }
    
    // Return default settings if none exist
    if (Object.keys(settings).length === 0) {
      res.json({
        primaryColor: '#3b82f6',
        theme: 'light'
      });
    } else {
      res.json(settings);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update settings - using key-value structure
router.post('/', async (req, res) => {
  try {
    const settingsToSave = req.body;
    const results = [];
    
    // Save each setting as a key-value pair
    for (const [key, value] of Object.entries(settingsToSave)) {
      // Check if setting exists
      const { data: existing } = await supabaseService.supabase
        .from('settings')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('key', key)
        .single();
      
      if (existing) {
        // Update existing
        const { data, error } = await supabaseService.supabase
          .from('settings')
          .update({ value })
          .eq('user_id', req.user.id)
          .eq('key', key)
          .select()
          .single();
        
        if (error) throw error;
        results.push(data);
      } else {
        // Create new
        const { data, error } = await supabaseService.supabase
          .from('settings')
          .insert({ user_id: req.user.id, key, value })
          .select()
          .single();
        
        if (error) throw error;
        results.push(data);
      }
    }
    
    // Return combined settings object
    const combined = {};
    results.forEach(item => {
      combined[item.key] = item.value;
    });
    res.json(combined);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

