import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { router } from './routes/index.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginOpenerPolicy: false }));
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = env().CLIENT_URL;
            if (!origin || origin === allowed || /^http:\/\/localhost:\d+$/.test(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin '${origin}' not allowed`));
            }
        },
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

app.use(router);
app.use(errorHandler);

export default app;
