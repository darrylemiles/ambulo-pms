import { colours } from './constants/constants.js';

/*  ========== Importing Middleware ========== */
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

/*  ========== Importing External Libraries ========== */
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';

/*  ========== Importing Routes ========== */
import usersRoutes from './routes/usersRoutes.js';
import propertiesRoutes from './routes/propertiesRoutes.js';
import ticketsRoutes from './routes/ticketsRoutes.js';
import companyDetailsRoutes from './routes/companyDetailsRoutes.js';
import addressesRoutes from './routes/addressesRoutes.js';
import faqsRoutes from './routes/faqsRoutes.js';
import leaseRoutes from './routes/leaseRoutes.js';
import leaseDefaultRoutes from './routes/leaseDefaultsRoutes.js';
import aboutUsRoutes from './routes/aboutUsRoutes.js';
import chargesRoutes from './routes/chargesRoutes.js';
import paymentsRoutes from './routes/paymentsRoutes.js';
import contactUsRoutes from './routes/contactUsRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';


import tables from './tables/tables.js';

/*  ========== Database Connection ========== */
import conn from './config/db.js';

const app = express();
const server = createServer(app);
const __dirname = path.resolve();
dotenv.config();

const API_VERSION = process.env.API_VERSION;
const PORT = process.env.PORT || 5000;
const PROJECT_NAME = process.env.PROJECT_NAME;

// Allow local dev origins and optionally extend via CORS_ORIGINS env (comma-separated)
const corsOrigins = [
    'http://localhost:5500',  // Live Server
    'http://127.0.0.1:5500',  // Live Server alternative
    'http://localhost:3000',
    'http://localhost:8080'
];
if (process.env.CORS_ORIGINS) {
    corsOrigins.push(
        ...process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    );
}

const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

/*  ========== API - Routes ========== */
app.use(`/api/${API_VERSION}/users`, usersRoutes);
app.use(`/api/${API_VERSION}/properties`, propertiesRoutes);
app.use(`/api/${API_VERSION}/tickets`, ticketsRoutes);
app.use(`/api/${API_VERSION}/company-details`, companyDetailsRoutes);
app.use(`/api/${API_VERSION}/addresses`, addressesRoutes);
app.use(`/api/${API_VERSION}/faqs`, faqsRoutes);
app.use(`/api/${API_VERSION}/leases`, leaseRoutes);
app.use(`/api/${API_VERSION}/lease-defaults`, leaseDefaultRoutes);
app.use(`/api/${API_VERSION}/about-us`, aboutUsRoutes);
app.use(`/api/${API_VERSION}/charges`, chargesRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentsRoutes);
app.use(`/api/${API_VERSION}/contact-us`, contactUsRoutes);
app.use(`/api/${API_VERSION}/messages`, messagesRoutes);

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'login.html'));
});

if (process.env.NODE_ENV === 'production') {
    // In production, serve the static client from the repo's client directory
    app.use(express.static(path.join(__dirname, '../client')));
    app.get('*', (req, res) => {
        // Fallback to index.html for non-API routes
        res.sendFile(path.join(__dirname, '../client', 'index.html'));
    });
} else {
    app.get(`/api/${API_VERSION}`, (req, res) => {
        res.send(`${PROJECT_NAME} API is running...`);
    });
}

/** Middleware */
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    // Initialize Socket.IO and attach to app for controllers to use
    const io = initializeSocket(server);
    app.set('io', io);
    try {
        server.listen(PORT, () => console.log(colours.fg.yellow, `${PROJECT_NAME}`, `API is running in ${process.env.NODE_ENV} mode on port ${PORT}`, colours.reset));
    } catch (error) {
        console.log(error);
    }
};

const createTables = async () => {
  try {
    const pool = await conn();
    await tables(pool);
  } catch (error) {
    console.error('Error setting up tables:', error);
  }
};


startServer();
createTables();