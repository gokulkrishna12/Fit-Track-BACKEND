const Workout = require('../models/Workout');
const redis = require('../services/redisService');

const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createWorkout = async (req, res) => {
    try {
        const { exerciseName, sets, reps, weight, date } = req.body;

        const workout = await Workout.create({
            user: req.user.id,
            exerciseName,
            sets,
            reps,
            weight,
            date
        });

        if (redis) {
            const userId = req.user._id || req.user.id;
            await redis.del(`analytics:${userId}`);
        }

        const io = req.app.get('io');
        if (io) {
            const userId = req.user._id || req.user.id;
            io.to(userId.toString()).emit('workout_updated');
        }

        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workout.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this workout' });
        }

        const updatedWorkout = await Workout.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after' }
        );

        if (redis) {
            const userId = req.user._id || req.user.id;
            await redis.del(`analytics:${userId}`);
        }

        const io = req.app.get('io');
        if (io) {
            const userId = req.user._id || req.user.id;
            io.to(userId.toString()).emit('workout_updated');
        }

        res.status(200).json(updatedWorkout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        // Security Check
        if (workout.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this workout' });
        }

        await workout.deleteOne();

        if (redis) {
            const userId = req.user._id || req.user.id;
            await redis.del(`analytics:${userId}`);
        }

        const io = req.app.get('io');
        if (io) {
            const userId = req.user._id || req.user.id;
            io.to(userId.toString()).emit('workout_updated');
        }

        res.status(200).json({ id: req.params.id, message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWorkoutAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const cacheKey = `analytics:${userId}`; // Unique cache key for this user

        // 1. CHECK CACHE FIRST (If Redis is active)
        if (redis) {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return res.status(200).json({
                    success: true,
                    data: cachedData,
                    cached: true // Tells the frontend this came from Redis
                });
            }
        }

        // 2. IF NOT CACHED, RUN MONGODB AGGREGATION
        const overviewStats = await Workout.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalWorkouts: { $sum: 1 },
                    totalVolume: { $sum: { $multiply: ["$sets", "$reps", "$weight"] } },
                    totalSets: { $sum: "$sets" },
                    totalReps: { $sum: "$reps" }
                }
            }
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyTrend = await Workout.aggregate([
            { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "\%Y-\%m-\%d", date: "$date" } },
                    dailyVolume: { $sum: { $multiply: ["$sets", "$reps", "$weight"] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const analyticsData = {
            overview: overviewStats[0] || { totalWorkouts: 0, totalVolume: 0, totalSets: 0, totalReps: 0 },
            weeklyTrend: weeklyTrend
        };

        // 3. STORE IN REDIS FOR NEXT TIME (Expires in 1 hour / 3600 seconds)
        if (redis) {
            await redis.set(cacheKey, analyticsData, { ex: 3600 });
        }

        res.status(200).json({
            success: true,
            data: analyticsData,
            cached: false
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWorkouts, createWorkout, updateWorkout, deleteWorkout, getWorkoutAnalytics };