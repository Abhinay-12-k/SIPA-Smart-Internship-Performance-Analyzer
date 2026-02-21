const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes (Placeholders for now)
app.use('/api/auth', require('./src/modules/auth/auth.routes'));
app.use('/api/users', require('./src/modules/users/user.routes'));
app.use('/api/tasks', require('./src/modules/tasks/task.routes'));
app.use('/api/performance', require('./src/modules/performance/performance.routes'));
app.use('/api/ai-feedback', require('./src/modules/ai/ai.routes'));
app.use('/api/activity', require('./src/modules/activity/activity.routes'));

// Base Routes
app.get('/', (req, res) => {
    res.send('SIPA API is running - v1.1 (Intern List Added)');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', routes: ['auth', 'users', 'tasks', 'performance', 'ai', 'activity'] });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
