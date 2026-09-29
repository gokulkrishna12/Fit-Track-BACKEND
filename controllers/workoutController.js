const Workout = require('../models/Workout');

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

        res.status(200).json({ id: req.params.id, message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWorkoutAnalytics = async (req, res, next) => {
    try {
        // req.user.id comes from your existing auth middleware
        const userId = req.user._id || req.user.id;

        // 1. Overall Stats Aggregation (Total volume, reps, workouts)
        const overviewStats = await Workout.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalWorkouts: { $sum: 1 },
                    // Calculate Total Volume: (sets * reps * weight)
                    totalVolume: { $sum: { $multiply: ["$sets", "$reps", "$weight"] } },
                    totalSets: { $sum: "$sets" },
                    totalReps: { $sum: "$reps" }
                }
            }
        ]);

        // 2. Weekly Trend Aggregation (Last 7 days volume)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyTrend = await Workout.aggregate([
            { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    // Group by the date string (YYYY-MM-DD)
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    dailyVolume: { $sum: { $multiply: ["$sets", "$reps", "$weight"] } }
                }
            },
            { $sort: { _id: 1 } } // Sort by date ascending
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: overviewStats[0] || { totalWorkouts: 0, totalVolume: 0, totalSets: 0, totalReps: 0 },
                weeklyTrend: weeklyTrend
            }
        });
    } catch (error) {
        // This will be caught by the Error Handler we built in Phase 2!
        next(error);
    }
};

module.exports = { getWorkouts, createWorkout, updateWorkout, deleteWorkout, getWorkoutAnalytics };