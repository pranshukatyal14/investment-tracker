import express from 'express';
import Investment from '../models/Investment.js';

const router = express.Router();

// Get all investments
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find().sort({ date: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new investment
router.post('/', async (req, res) => {
  try {
    const investment = new Investment(req.body);
    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete investment
router.delete('/:id', async (req, res) => {
  try {
    await Investment.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
