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

module.exports = { getWorkouts, createWorkout, updateWorkout, deleteWorkout };