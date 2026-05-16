const express = require('express');
const router = express.Router();
const Goal = require('./goal.model');
const { protect } = require("../../middleware/auth");

// All goal routes require authentication
router.use(protect);

// Get all goals for user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.userId }).sort({ targetDate: 1 });
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new goal
router.post('/', async (req, res) => {
  try {
    const { name, targetAmount, targetDate, color } = req.body;
    const goal = new Goal({
      user: req.userId,
      name,
      targetAmount,
      targetDate,
      color
    });
    await goal.save();
    res.status(201).json({ goal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a goal
router.put('/:id', async (req, res) => {
  try {
    const { name, targetAmount, targetDate, color } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, targetAmount, targetDate, color },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ goal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add funds to a goal
router.patch('/:id/add-funds', async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $inc: { currentAmount: amount } },
      { returnDocument: 'after' } // updated for Mongoose 9
    );
    
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ goal });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
