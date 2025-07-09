import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { fetchMovieByTitle } from '../services/omdbService';
import { searchMovies } from '../services/omdbService'; // Importa la nueva función

//const db = admin.firestore();
//const moviesCollection = db.collection('movies');
const DEFAULT_TITLES = [
  'The Matrix',
  'Inception',
  'Interstellar',
  'The Godfather',
  'Pulp Fiction',
  'The Dark Knight',
  'Fight Club',
  'Forrest Gump',
  'The Shawshank Redemption',
  'The Lord of the Rings'
];
// 🔹 Obtener películas favoritas del usuario
export const getMovies = async (req: Request, res: Response) => {
  const uid = req.uid;
  try {
    const db = admin.firestore();
    const moviesCollection = db.collection('movies');
    const snapshot = await moviesCollection.where('userId', '==', uid).get();
    const movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(movies);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener películas.', error });
  }
};
// 🔹 Agregar película a favoritos
export const addMovie = async (req: Request, res: Response) => {
  const uid = req.uid;
  const { title, year, director, genre, poster } = req.body;

  if (!title || !year || !director || !genre) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }

  try {
    const db = admin.firestore();
    const moviesCollection = db.collection('movies');

    const newMovie = {
      userId: uid,
      title,
      year,
      director,
      genre,
      poster: poster || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await moviesCollection.add(newMovie);
    return res.status(201).json({ message: 'Película agregada.', id: docRef.id });
  } catch (error) {
    return res.status(500).json({ message: 'Error al agregar película.', error });
  }
};

// 🔹 Editar película
export const updateMovie = async (req: Request, res: Response) => {
  const uid = req.uid;
  const movieId = req.params.id;
  const { title, year, director, genre } = req.body;

  try {
    const db = admin.firestore();
    const moviesCollection = db.collection('movies');
    const movieRef = moviesCollection.doc(movieId);
    const doc = await movieRef.get();

    if (!doc.exists || doc.data()?.userId !== uid) {
      return res.status(404).json({ message: 'Película no encontrada o no autorizada.' });
    }

    await movieRef.update({ title, year, director, genre });
    return res.status(200).json({ message: 'Película actualizada.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar película.', error });
  }
};

// 🔹 Eliminar película
export const deleteMovie = async (req: Request, res: Response) => {
  const uid = req.uid;
  const movieId = req.params.id;

  try {
    const db = admin.firestore();
    const moviesCollection = db.collection('movies');
    const movieRef = moviesCollection.doc(movieId);
    const doc = await movieRef.get();

    if (!doc.exists || doc.data()?.userId !== uid) {
      return res.status(404).json({ message: 'Película no encontrada o no autorizada.' });
    }

    await movieRef.delete();
    return res.status(200).json({ message: 'Película eliminada.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar película.', error });
  }
}

// 🔹 Obtener películas públicas
export const getPublicMovies = async (req: Request, res: Response) => {
  try {
    // Busca las 10 películas por título en OMDB
    const movies = await Promise.all(
      DEFAULT_TITLES.map(title => fetchMovieByTitle(title))
    );
    // Filtra resultados válidos
    const validMovies = movies.filter(m => m && m.Response !== 'False');
    return res.status(200).json(validMovies);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener películas públicas.', error });
  }

};


//Endpoint para obtener las películas por título
export const searchOMDBMovies = async (req: Request, res: Response) => {
  const { query, page } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'El parámetro "query" es requerido.' });
  }

  try {
    const result = await searchMovies(
      query.toString(),
      page ? parseInt(page.toString()) : 1
    );

    if (result.Response === 'False') {
      return res.status(404).json({ message: result.Error || 'No se encontraron películas.' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al buscar películas en OMDB.',
      //error: error.message
    });
  }
};
