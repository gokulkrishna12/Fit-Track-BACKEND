const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const { Server } = require('socket.io');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://fit-track-frontend-delta.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('⚡ A user connected to WebSocket:', socket.id);

    // When a user logs in, they join a private room with their User ID
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

app.use(errorHandler);
// Basic Route to test
app.get('/', (req, res) => {
    res.send('FitTrack API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});