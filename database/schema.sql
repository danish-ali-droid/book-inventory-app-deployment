-- =============================================
-- Book Inventory Database Schema
-- PostgreSQL Database Setup
-- =============================================

-- Create database (run this separately as postgres superuser)
-- CREATE DATABASE book_inventory;

-- Connect to the database
-- \c book_inventory

-- =============================================
-- Drop existing tables if they exist
-- =============================================
-- DROP TABLE IF EXISTS books CASCADE;

-- =============================================
-- Create Books Table
-- =============================================
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    genre VARCHAR(100),
    publication_year INTEGER CHECK (publication_year >= 1000 AND publication_year <= 9999),
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    price NUMERIC(10, 2) CHECK (price >= 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Create Indexes for better query performance
-- =============================================
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- =============================================
-- Create trigger to automatically update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Insert sample data
-- =============================================
INSERT INTO books (title, author, isbn, genre, publication_year, quantity, price, description) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Fiction', 1925, 15, 14.99, 'A story of decadence and excess, Gatsby explores the American Dream in the Jazz Age.'),
('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'Fiction', 1960, 20, 12.99, 'A gripping tale of racial injustice and childhood innocence in the American South.'),
('1984', 'George Orwell', '978-0451524935', 'Dystopian', 1949, 25, 11.99, 'A dystopian novel about totalitarianism, surveillance, and the manipulation of truth.'),
('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'Romance', 1813, 18, 9.99, 'A romantic novel that charts the emotional development of Elizabeth Bennet.'),
('The Catcher in the Rye', 'J.D. Salinger', '978-0316769488', 'Fiction', 1951, 12, 13.99, 'A story about teenage alienation and loss of innocence.'),
('One Hundred Years of Solitude', 'Gabriel García Márquez', '978-0060883287', 'Magical Realism', 1967, 10, 16.99, 'The multi-generational story of the Buendía family in the fictional town of Macondo.'),
('The Lord of the Rings', 'J.R.R. Tolkien', '978-0618640157', 'Fantasy', 1954, 30, 29.99, 'An epic high-fantasy novel set in Middle-earth.'),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '978-0590353427', 'Fantasy', 1997, 50, 19.99, 'The first book in the Harry Potter series about a young wizard.'),
('The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', '978-0345391803', 'Science Fiction', 1979, 22, 10.99, 'A comedic science fiction series following Arthur Dent''s adventures in space.'),
('Clean Code', 'Robert C. Martin', '978-0132350884', 'Technology', 2008, 8, 39.99, 'A handbook of agile software craftsmanship.');

-- =============================================
-- Verify data
-- =============================================
SELECT 'Books table created successfully with ' || COUNT(*) || ' records.' AS status FROM books;
