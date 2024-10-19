import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import dbConnection from './database/dbConnection.js';
import userRouter from './routes/userRouter.js';
import cookieParser from 'cookie-parser';

dotenv.config({ path: './config/config.env' });

const app = express();
// const PORT = process.env.PORT || 5000;

// Log environment variables (consider removing in production)
// console.log({ PORT, ...process.env });

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'], // Add localhost for local testing
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/user', userRouter);

// Connect to database
dbConnection();

// Error handling middleware
app.use(errorMiddleware);


// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app