import { useState, useEffect, useCallback } from 'react';
import BookCard from './components/BookCard';
import BookForm from './components/BookForm';
import Modal from './components/Modal';
import SearchBar from './components/SearchBar';
import Toast, { ToastType } from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import { Book } from './types/book';
import bookApi from './api/bookApi';

// Demo data for when backend is not available
const DEMO_BOOKS: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    genre: 'Fiction',
    publication_year: 1925,
    quantity: 15,
    price: 14.99,
    description: 'A story of decadence and excess, Gatsby explores the American Dream in the Jazz Age.',
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0061120084',
    genre: 'Fiction',
    publication_year: 1960,
    quantity: 20,
    price: 12.99,
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    genre: 'Dystopian',
    publication_year: 1949,
    quantity: 25,
    price: 11.99,
    description: 'A dystopian novel about totalitarianism, surveillance, and the manipulation of truth.',
  },
  {
    id: 4,
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    isbn: '978-0618640157',
    genre: 'Fantasy',
    publication_year: 1954,
    quantity: 30,
    price: 29.99,
    description: 'An epic high-fantasy novel set in Middle-earth.',
  },
  {
    id: 5,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    genre: 'Technology',
    publication_year: 2008,
    quantity: 8,
    price: 39.99,
    description: 'A handbook of agile software craftsmanship.',
  },
  {
    id: 6,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0141439518',
    genre: 'Romance',
    publication_year: 1813,
    quantity: 18,
    price: 9.99,
    description: 'A romantic novel that charts the emotional development of Elizabeth Bennet.',
  },
];

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookId: number | null;
  }>({
    isOpen: false,
    bookId: null,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Load books
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bookApi.getAllBooks();
      if (response.success && response.data) {
        setBooks(response.data);
        setIsDemo(false);
      } else {
        // Use demo data if backend is not available
        setBooks(DEMO_BOOKS);
        setIsDemo(true);
      }
    } catch {
      // Use demo data if backend is not available
      setBooks(DEMO_BOOKS);
      setIsDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Filter books
  useEffect(() => {
    let result = [...books];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.isbn && book.isbn.toLowerCase().includes(query))
      );
    }

    if (selectedGenre) {
      result = result.filter((book) => book.genre === selectedGenre);
    }

    setFilteredBooks(result);
  }, [books, searchQuery, selectedGenre]);

  // Create or Update book
  const handleSubmit = async (bookData: Partial<Book>) => {
    setIsSubmitting(true);

    if (isDemo) {
      // Demo mode - local operations
      if (editingBook) {
        setBooks((prev) =>
          prev.map((b) => (b.id === editingBook.id ? { ...b, ...bookData } : b))
        );
        showToast('Book updated successfully! (Demo Mode)', 'success');
      } else {
        const newBook: Book = {
          ...bookData,
          id: Math.max(...books.map((b) => b.id || 0)) + 1,
          quantity: bookData.quantity || 1,
        } as Book;
        setBooks((prev) => [newBook, ...prev]);
        showToast('Book added successfully! (Demo Mode)', 'success');
      }
      setIsModalOpen(false);
      setEditingBook(null);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingBook && editingBook.id) {
        const response = await bookApi.updateBook(editingBook.id, bookData);
        if (response.success) {
          showToast('Book updated successfully!', 'success');
          fetchBooks();
          setIsModalOpen(false);
          setEditingBook(null);
        } else {
          showToast(response.error || 'Failed to update book', 'error');
        }
      } else {
        const response = await bookApi.createBook(bookData as Book);
        if (response.success) {
          showToast('Book added successfully!', 'success');
          fetchBooks();
          setIsModalOpen(false);
        } else {
          showToast(response.error || 'Failed to add book', 'error');
        }
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete book
  const handleDelete = async () => {
    if (!confirmDialog.bookId) return;

    setIsSubmitting(true);

    if (isDemo) {
      setBooks((prev) => prev.filter((b) => b.id !== confirmDialog.bookId));
      showToast('Book deleted successfully! (Demo Mode)', 'success');
      setConfirmDialog({ isOpen: false, bookId: null });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await bookApi.deleteBook(confirmDialog.bookId);
      if (response.success) {
        showToast('Book deleted successfully!', 'success');
        fetchBooks();
      } else {
        showToast(response.error || 'Failed to delete book', 'error');
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setConfirmDialog({ isOpen: false, bookId: null });
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ isOpen: true, bookId: id });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
  };

  // Calculate stats
  const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0);
  const totalValue = books.reduce((sum, book) => sum + (book.price || 0) * book.quantity, 0);
  const uniqueTitles = books.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Book Inventory</h1>
                <p className="text-sm text-gray-500">Manage your book collection</p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingBook(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Book
            </button>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800">
                <span className="font-medium">Demo Mode:</span> Backend not connected. Changes are stored locally. 
                Start the Flask backend to enable full functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unique Titles</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueTitles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchBar
          searchQuery={searchQuery}
          selectedGenre={selectedGenre}
          onSearchChange={setSearchQuery}
          onGenreChange={setSelectedGenre}
          onClear={clearFilters}
        />

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedGenre
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first book to the inventory.'}
            </p>
            {!searchQuery && !selectedGenre && (
              <button
                onClick={() => {
                  setEditingBook(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Book
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredBooks.length > 0 && (
          <p className="text-sm text-gray-500 mt-6 text-center">
            Showing {filteredBooks.length} of {books.length} books
          </p>
        )}
      </main>

      {/* Add/Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        title={editingBook ? 'Edit Book' : 'Add New Book'}
      >
        <BookForm
          book={editingBook}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBook(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, bookId: null })}
        isLoading={isSubmitting}
        variant="danger"
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Book Inventory Management System • Built with React + Flask + PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
