const Workout = require('../models/Workout');
const redis = require('../services/redisService');

// @desc    Get all workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
    try {
        const workouts = await Workout.find({ user: req.user._id || req.user.id }).sort({ date: -1, createdAt: -1 });
        res.status(200).json(workouts);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const workout = await Workout.create({
            ...req.body,
            user: userId
        });

        // Trigger real-time update on the frontend via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(userId.toString()).emit('workout_updated');
        }

        res.status(201).json(workout);
    } catch (error) {
        next(error);
    }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Trigger real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(userId.toString()).emit('workout_updated');
        }

        res.status(200).json(workout);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        await Workout.findByIdAndDelete(req.params.id);

        // Trigger real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(userId.toString()).emit('workout_updated');
        }

        res.status(200).json({ message: 'Workout deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get workout analytics for dashboard
// @route   GET /api/workouts/analytics
// @access  Private
const getWorkoutAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const cacheKey = `analytics:${userId}`;

        // 1. CHECK CACHE FIRST
        if (redis) {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return res.status(200).json({ success: true, data: cachedData, cached: true });
            }
        }

        // 2. FETCH WORKOUTS AND CALCULATE IN JAVASCRIPT
        const workouts = await Workout.find({ user: userId });

        let totalWorkouts = workouts.length;
        let totalVolume = 0;
        let totalSets = 0;
        let totalReps = 0;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setHours(0, 0, 0, 0);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyDataMap = {};

        workouts.forEach(w => {
            // Force convert strings to numbers so math doesn't fail
            const sets = Number(w.sets) || 1;
            const reps = Number(w.reps) || 0;
            const weight = Number(w.weight) || 0;

            totalSets += sets;
            totalReps += reps;
            const workoutVolume = (sets * reps * weight);
            totalVolume += workoutVolume;

            // Date logic for Weekly Trend
            if (w.date) {
                const workoutDate = new Date(w.date);
                if (workoutDate >= sevenDaysAgo) {
                    const dateString = w.date; // e.g. "2026-09-29"
                    if (!weeklyDataMap[dateString]) {
                        weeklyDataMap[dateString] = 0;
                    }
                    weeklyDataMap[dateString] += workoutVolume;
                }
            }
        });

        // Convert the map into an array sorted by date for Recharts
        const weeklyTrend = Object.keys(weeklyDataMap).sort().map(date => ({
            _id: date,
            dailyVolume: weeklyDataMap[date]
        }));

        const analyticsData = {
            overview: { totalWorkouts, totalVolume, totalSets, totalReps },
            weeklyTrend: weeklyTrend
        };

        // 3. STORE IN REDIS
        if (redis) {
            await redis.set(cacheKey, analyticsData, { ex: 3600 });
        }

        res.status(200).json({ success: true, data: analyticsData, cached: false });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutAnalytics
};