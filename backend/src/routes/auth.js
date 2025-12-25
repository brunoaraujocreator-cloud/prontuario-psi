import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Login endpoint (handled by Supabase Auth on frontend)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({ user: data.user, session: data.session });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    // Create user profile if user was created
    if (data.user && name) {
      try {
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: name
          });
      } catch (profileError) {
        // Log but don't fail - profile can be created later
        console.error('Error creating user profile:', profileError);
      }
    }

    res.json({ user: data.user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

