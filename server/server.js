import { colours } from './constants/constants.js';

/*  ========== Importing Middleware ========== */
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import cookieParser from 'cookie-parser';

/*  ========== Importing External Libraries ========== */
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';
import fs from 'fs';

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const API_VERSION = process.env.API_VERSION;
const PORT = process.env.PORT || 5000;
const PROJECT_NAME = process.env.PROJECT_NAME;

const corsOptions = {
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(cookieParser());

app.get('/index.html', (req, res) => {
    return res.redirect(301, '/');
});

app.get(/^\/(?:([^\/]+))\.html$/, (req, res, next) => {
    const base = req.params[0];
    const candidate = path.join(__dirname, '../client', `${base}.html`);
    if (fs.existsSync(candidate)) {
        return res.redirect(301, `/${base}`);
    }
    return next();
});

app.use(express.static(path.join(__dirname, '../client'), { index: false }));

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'login.html'));
});

const aliasRoutes = {
    '/properties': 'propertySpaces.html',
    '/payments': 'paymentTenant.html',
    '/leases': 'leaseTenant.html'
};

for (const [routePath, htmlFile] of Object.entries(aliasRoutes)) {
    app.get(routePath, (req, res) => {
        res.sendFile(path.join(__dirname, '../client', htmlFile));
    });
}

app.get(/^\/(?!api\/|assets\/|css\/|javascript\/|fonts\/|components\/|favicon\/).+$/, (req, res, next) => {
    const raw = req.path.replace(/\/+$/, '');
    if (!raw || raw === '/') return next();

    if (aliasRoutes[raw]) {
        return res.sendFile(path.join(__dirname, '../client', aliasRoutes[raw]));
    }

    const parts = raw.replace(/^\//, '').split('/');
    const hyphenName = parts.join('-');
    const collapsedLower = hyphenName.replace(/[-_]/g, '').toLowerCase();

    const toCamelFromHyphen = (s) => s
        .toLowerCase()
        .split('-')
        .map((p, i) => i === 0 ? p : (p.charAt(0).toUpperCase() + p.slice(1)))
        .join('');

    const camelAcross = parts
        .map(seg => toCamelFromHyphen(seg))
        .map((seg, i) => i === 0 ? seg : (seg.charAt(0).toUpperCase() + seg.slice(1)))
        .join('');

    const pascalAcross = camelAcross.charAt(0).toUpperCase() + camelAcross.slice(1);

    const candidates = [
        `${hyphenName}.html`,
        `${collapsedLower}.html`,
        `${camelAcross}.html`,
        `${pascalAcross}.html`
    ];

    if (collapsedLower === 'faqs') {
        candidates.unshift('FAQs.html');
    } else if (collapsedLower === 'faq') {
        candidates.unshift('FAQ.html');
    }

    for (const file of candidates) {
        const absolute = path.join(__dirname, '../client', file);
        if (fs.existsSync(absolute)) {
            return res.sendFile(absolute);
        }
    }
    return next();
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client'), { index: false }));
    app.get(/^\/(?!api\/).*/, (req, res) => {
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