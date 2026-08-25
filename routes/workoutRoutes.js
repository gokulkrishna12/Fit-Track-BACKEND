const express = require('express');
const router = express.Router();
const {
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

// Ellame protected routes dhaan, so "protect" middleware-a add panrom
router.route('/')
    .get(protect, getWorkouts)
    .post(protect, createWorkout);

router.route('/:id')
    .put(protect, updateWorkout)
    .delete(protect, deleteWorkout);

module.exports = router;