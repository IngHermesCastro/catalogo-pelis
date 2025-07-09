import * as functions from 'firebase-functions';
import express from 'express';
import * as admin from 'firebase-admin';
import movieRoutes from './routes/movies';
import cors from 'cors';

admin.initializeApp();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

//app.use('/api/auth', authRoutes);
app.use('/movies', movieRoutes);

export const api = functions.https.onRequest(app);
