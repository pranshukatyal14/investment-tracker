import express from 'express';
import Dividend from '../models/Dividend.js';

const router = express.Router();

// Get all dividends
router.get('/', async (req, res) => {
  try {
    const dividends = await Dividend.find().sort({ date: -1 });
    res.json(dividends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new dividend
router.post('/', async (req, res) => {
  const dividend = new Dividend({
    amount: req.body.amount,
    company: req.body.company,
    stockSymbol: req.body.stockSymbol,
    date: req.body.date,
    notes: req.body.notes,
  });

  try {
    const newDividend = await dividend.save();
    res.status(201).json(newDividend);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a dividend
router.delete('/:id', async (req, res) => {
  try {
    await Dividend.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dividend deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
