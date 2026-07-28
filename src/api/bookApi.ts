/**
 * Book API Service
 * Handles all API calls to the Flask backend
 */

const API_BASE_URL = 'http://my-book-store-backend:5000/api';

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

class BookApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // GET all books
  async getAllBooks(params?: { search?: string; genre?: string; author?: string }): Promise<ApiResponse<Book[]>> {
    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.genre) searchParams.append('genre', params.genre);
      if (params.author) searchParams.append('author', params.author);
      queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    }
    return this.request<Book[]>(`/books${queryString}`);
  }

  // GET single book by ID
  async getBook(id: number): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/books/${id}`);
  }

  // POST create new book
  async createBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Book>> {
    return this.request<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  // PUT update book
  async updateBook(id: number, book: Partial<Book>): Promise<ApiResponse<Book>> {
    return this.request<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  }

  // DELETE book
  async deleteBook(id: number): Promise<ApiResponse<null>> {
    return this.request<null>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.request<{ status: string; message: string }>('/health');
    return response.data || { status: 'error', message: 'Health check failed' };
  }
}

export const bookApi = new BookApiService();
export default bookApi;
