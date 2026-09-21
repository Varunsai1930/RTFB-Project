"""
InvisiWork Backend — Extension Instances

Instantiates PyMongo, bcrypt, and CORS objects without binding them to a Flask app.
Binding happens in the app factory (app/__init__.py) via init_app() calls.

This pattern avoids circular imports and supports multiple app instances (e.g. testing).
"""

from flask_cors import CORS
from pymongo import MongoClient

# CORS instance — configured in create_app()
cors = CORS()

# MongoDB client and database references — set in create_app()
mongo_client = None
mongo_db = None
