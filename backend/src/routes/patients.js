import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseService } from '../services/supabase.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await supabaseService.getAll('patients', req.user.id);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await supabaseService.getById('patients', req.params.id, req.user.id);
    res.json(patient);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const patient = await supabaseService.create('patients', req.body, req.user.id);
    
    // Log action
    await supabaseService.create('recent_actions', {
      type: 'create',
      entity_type: 'patient',
      entity_id: patient.id,
      entity_name: patient.name,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await supabaseService.update('patients', req.params.id, req.body, req.user.id);
    
    // Log action
    await supabaseService.create('recent_actions', {
      type: 'edit',
      entity_type: 'patient',
      entity_id: patient.id,
      entity_name: patient.name,
      timestamp: new Date().toISOString()
    }, req.user.id);

    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await supabaseService.getById('patients', req.params.id, req.user.id);
    if (patient) {
      // 1. Move to trash
      await supabaseService.create('trash', {
        entity_type: 'patient',
        entity_id: patient.id,
        entity_data: patient,
        deleted_at: new Date().toISOString()
      }, req.user.id);

      // 2. Delete from original table
      await supabaseService.delete('patients', req.params.id, req.user.id);

      // 3. Log action
      await supabaseService.create('recent_actions', {
        type: 'delete',
        entity_type: 'patient',
        entity_id: patient.id,
        entity_name: patient.name,
        timestamp: new Date().toISOString()
      }, req.user.id);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;



