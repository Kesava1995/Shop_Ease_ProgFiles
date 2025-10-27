import os
from flask import Flask, jsonify, send_from_directory
from config import Config
from extensions import db, bcrypt, migrate, jwt, cors
from models import User
from routes.admin_routes import admin_api
from routes.user_routes import user_api
from routes.product_routes import product_api

def create_app(config_class=Config):

    app = Flask(__name__)

    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    app.register_blueprint(admin_api, url_prefix='/api/admin')
    app.register_blueprint(user_api, url_prefix='/api')
    app.register_blueprint(product_api, url_prefix='/api')

    @app.route('/uploads/<string:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/')
    def index():
        return jsonify({"message": "Welcome to the E-commerce API"}), 200

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)