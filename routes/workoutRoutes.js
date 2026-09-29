const express = require('express');
const router = express.Router();
const {
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutAnalytics
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getWorkoutAnalytics);

router.route('/')
    .get(protect, getWorkouts)
    .post(protect, createWorkout);

router.route('/:id')
    .put(protect, updateWorkout)
    .delete(protect, deleteWorkout);

module.exports = router;