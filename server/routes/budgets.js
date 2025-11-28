import express from 'express';
import Budget from '../models/Budget.js';
import Investment from '../models/Investment.js';

const router = express.Router();

// Get budget with category allocations
router.get('/:month', async (req, res) => {
  try {
    const budget = await Budget.findOne({ month: req.params.month });
    if (!budget) return res.json(null);

    // Calculate spent amounts per category
    const investments = await Investment.find({
      date: {
        $gte: new Date(req.params.month + '-01'),
        $lt: new Date(req.params.month + '-31')
      }
    });

    const categorySpent = {};
    investments.forEach(inv => {
      categorySpent[inv.category] = (categorySpent[inv.category] || 0) + inv.amount;
    });

    // Add spent and remaining to allocations
    const enrichedAllocations = budget.categoryAllocations.map(allocation => ({
      ...allocation.toObject(),
      spent: categorySpent[allocation.categoryName] || 0,
      remaining: (allocation.allocatedAmount + allocation.carryOver) - (categorySpent[allocation.categoryName] || 0)
    }));

    res.json({
      ...budget.toObject(),
      categoryAllocations: enrichedAllocations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set budget with category allocations
router.post('/', async (req, res) => {
  try {
    const { month, totalAmount, categoryAllocations } = req.body;
    
    const budget = await Budget.findOneAndUpdate(
      { month },
      { totalAmount, categoryAllocations },
      { upsert: true, new: true }
    );
    
    res.json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
