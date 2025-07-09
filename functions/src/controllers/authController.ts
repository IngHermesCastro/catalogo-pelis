import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const auth = admin.auth();


  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    // 1. Crear el usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Guardar info adicional en Firestore (colección "users")
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    return res.status(500).json({ message: 'Error al registrar usuario.', error: error.message });
  }
};
