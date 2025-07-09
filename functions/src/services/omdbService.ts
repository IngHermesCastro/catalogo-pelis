import axios from 'axios';
import { OMDB_API_KEY, OMDB_BASE_URL } from '../config';

export async function fetchMovieByTitle(title: string) {
  const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
  const response = await axios.get(url);
  return response.data;
}

//Función para Búsquedas generales
export async function searchMovies(query: string, page: number = 1) {
  const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&page=${page}`;
  const response = await axios.get(url);
  return response.data;
}
