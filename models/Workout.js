const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    // Endha user indha workout add pannanga nu store panna indha line romba mukkiyam
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    exerciseName: {
        type: String,
        required: true,
    },
    sets: {
        type: Number,
        required: true,
    },
    reps: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number, // In kg
        required: true,
    },
    date: {
        type: String, // String aave vechikalam format panrathuku (e.g., "24-08-2026")
        required: true,
    }
}, {
    timestamps: true // Auto-ah create/update time track aagum
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;