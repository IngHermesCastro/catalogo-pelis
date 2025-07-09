import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }
}
