"""
API Routes for Book Inventory CRUD operations
"""
from flask import Blueprint, request, jsonify
from models import db, Book
from sqlalchemy.exc import IntegrityError

api = Blueprint('api', __name__, url_prefix='/api')

# ============== CRUD Operations ==============

# CREATE - Add a new book
@api.route('/books', methods=['POST'])
def create_book():
    """Create a new book in the inventory"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('author'):
            return jsonify({
                'success': False,
                'error': 'Title and author are required fields'
            }), 400
        
        # Create new book instance
        book = Book(
            title=data['title'],
            author=data['author'],
            isbn=data.get('isbn'),
            genre=data.get('genre'),
            publication_year=data.get('publication_year'),
            quantity=data.get('quantity', 1),
            price=data.get('price'),
            description=data.get('description')
        )
        
        db.session.add(book)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Book created successfully',
            'data': book.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'A book with this ISBN already exists'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# READ - Get all books
@api.route('/books', methods=['GET'])
def get_all_books():
    """Retrieve all books from the inventory"""
    try:
        # Optional query parameters for filtering
        genre = request.args.get('genre')
        author = request.args.get('author')
        search = request.args.get('search')
        
        query = Book.query
        
        if genre:
            query = query.filter(Book.genre.ilike(f'%{genre}%'))
        if author:
            query = query.filter(Book.author.ilike(f'%{author}%'))
        if search:
            query = query.filter(
                db.or_(
                    Book.title.ilike(f'%{search}%'),
                    Book.author.ilike(f'%{search}%'),
                    Book.isbn.ilike(f'%{search}%')
                )
            )
        
        books = query.order_by(Book.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'count': len(books),
            'data': [book.to_dict() for book in books]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# READ - Get a single book by ID
@api.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Retrieve a single book by its ID"""
    try:
        book = Book.query.get(book_id)
        
        if not book:
            return jsonify({
                'success': False,
                'error': 'Book not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': book.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# UPDATE - Update a book
@api.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """Update an existing book"""
    try:
        book = Book.query.get(book_id)
        
        if not book:
            return jsonify({
                'success': False,
                'error': 'Book not found'
            }), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            book.title = data['title']
        if 'author' in data:
            book.author = data['author']
        if 'isbn' in data:
            book.isbn = data['isbn']
        if 'genre' in data:
            book.genre = data['genre']
        if 'publication_year' in data:
            book.publication_year = data['publication_year']
        if 'quantity' in data:
            book.quantity = data['quantity']
        if 'price' in data:
            book.price = data['price']
        if 'description' in data:
            book.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Book updated successfully',
            'data': book.to_dict()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'A book with this ISBN already exists'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# DELETE - Delete a book
@api.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Delete a book from the inventory"""
    try:
        book = Book.query.get(book_id)
        
        if not book:
            return jsonify({
                'success': False,
                'error': 'Book not found'
            }), 404
        
        db.session.delete(book)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Book deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Health check endpoint
@api.route('/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Book Inventory API is running'
    }), 200
