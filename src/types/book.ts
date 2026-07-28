/**
 * Book type definitions
 */

export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_year?: number;
  quantity: number;
  price?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publication_year: string;
  quantity: string;
  price: string;
  description: string;
}

export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Horror',
  'Thriller',
  'Biography',
  'History',
  'Technology',
  'Self-Help',
  'Poetry',
  'Drama',
  'Dystopian',
  'Magical Realism',
  'Other',
];

export const emptyBookForm: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  publication_year: '',
  quantity: '1',
  price: '',
  description: '',
};
