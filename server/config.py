import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:

    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-super-secret-key-change-this'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key-change-this-too'

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'ecommerce.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)