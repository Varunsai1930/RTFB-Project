"""
InvisiWork Backend — Extension Instances

Instantiates PyMongo, bcrypt, and CORS objects without binding them to a Flask app.
Binding happens in the app factory (app/__init__.py) via init_app() calls.

Uses dynamic proxies for mongo_client and mongo_db so modules that import them
directly (e.g. from app.extensions import mongo_db) always resolve to the active
client/database even when swapped dynamically during tests (mongomock).
"""

import sys
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.local import LocalProxy

# CORS instance — configured in create_app()
cors = CORS()

# Internal MongoDB storage
_mongo_client = None
_mongo_db = None

# Dynamic proxies resolving to the active instances at runtime
mongo_client = LocalProxy(lambda: _mongo_client)
mongo_db = LocalProxy(lambda: _mongo_db)


class _ExtensionsModule(sys.modules[__name__].__class__):
    """Module wrapper to intercept direct attribute assignments to mongo_db/mongo_client."""

    def __setattr__(self, name, value):
        if name == "mongo_db" and not isinstance(value, LocalProxy):
            global _mongo_db
            _mongo_db = value
        elif name == "mongo_client" and not isinstance(value, LocalProxy):
            global _mongo_client
            _mongo_client = value
        else:
            super().__setattr__(name, value)


sys.modules[__name__].__class__ = _ExtensionsModule
