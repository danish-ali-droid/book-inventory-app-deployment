import React from 'react';
import { Book } from '../types/book';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: number) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  const getGenreColor = (genre?: string): string => {
    const colors: Record<string, string> = {
      Fiction: 'bg-blue-100 text-blue-800',
      'Non-Fiction': 'bg-green-100 text-green-800',
      Fantasy: 'bg-purple-100 text-purple-800',
      'Science Fiction': 'bg-cyan-100 text-cyan-800',
      Mystery: 'bg-yellow-100 text-yellow-800',
      Romance: 'bg-pink-100 text-pink-800',
      Horror: 'bg-red-100 text-red-800',
      Thriller: 'bg-orange-100 text-orange-800',
      Biography: 'bg-teal-100 text-teal-800',
      History: 'bg-amber-100 text-amber-800',
      Technology: 'bg-indigo-100 text-indigo-800',
      'Self-Help': 'bg-lime-100 text-lime-800',
      Dystopian: 'bg-gray-100 text-gray-800',
      'Magical Realism': 'bg-violet-100 text-violet-800',
    };
    return colors[genre || ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {book.title}
            </h3>
            <p className="text-gray-600 text-sm">by {book.author}</p>
          </div>
          {book.genre && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(book.genre)}`}>
              {book.genre}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {book.isbn && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-mono">{book.isbn}</span>
            </div>
          )}
          {book.publication_year && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{book.publication_year}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {book.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{book.description}</p>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className={`text-sm font-medium ${book.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.quantity} in stock
              </span>
            </div>
            {book.price !== undefined && book.price !== null && (
              <span className="text-lg font-bold text-indigo-600">
                ${book.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(book)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit book"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => book.id && onDelete(book.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete book"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
