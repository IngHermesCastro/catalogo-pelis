import * as express from 'express';
import { verifyToken } from '../middlewares/auth';
import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  getPublicMovies,
  searchOMDBMovies,
} from '../controllers/movieController';

const router = express.Router();

router.get('/public', getPublicMovies);
router.use(verifyToken); // proteger todas las rutas siguientes

router.get('/', getMovies);
router.post('/', addMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
router.get('/search', searchOMDBMovies);

export default router;
