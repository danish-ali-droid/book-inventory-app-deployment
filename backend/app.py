"""
Flask Application - Book Inventory API
Main entry point for the application
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes import api
from config import config

def create_app(config_name=None):
    """Application factory for creating Flask app instances"""
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Enable CORS for all routes (allow frontend to communicate)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(api)
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'name': 'Book Inventory API',
            'version': '1.0.0',
            'description': 'A simple CRUD API for managing book inventory',
            'endpoints': {
                'GET /api/books': 'Get all books',
                'GET /api/books/<id>': 'Get a specific book',
                'POST /api/books': 'Create a new book',
                'PUT /api/books/<id>': 'Update a book',
                'DELETE /api/books/<id>': 'Delete a book',
                'GET /api/health': 'Health check'
            }
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Resource not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app


# Run the application
if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
