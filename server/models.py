from extensions import db
from datetime import datetime
from sqlalchemy.orm import relationship

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    cart_items = relationship('CartItem', back_populates='user', cascade='all, delete-orphan')
    wishlist_items = relationship('WishlistItem', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.String(255), nullable=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(50), nullable=True)

    cart_items = relationship('CartItem', back_populates='product', cascade='all, delete')
    wishlist_items = relationship('WishlistItem', back_populates='product', cascade='all, delete')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'stock': self.stock,
            'image_url': self.image_url,
            'date_added': self.date_added.isoformat(),
            'category': self.category
        }

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)

    user = relationship('User', back_populates='cart_items')
    product = relationship('Product', back_populates='cart_items')

    def to_dict(self):
        return {
            'id': self.id,
            'quantity': self.quantity,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product': self.product.to_dict()
        }

class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)

    user = relationship('User', back_populates='wishlist_items')
    product = relationship('Product', back_populates='wishlist_items')

    __table_args__ = (db.UniqueConstraint('user_id', 'product_id', name='_user_product_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product': self.product.to_dict()
        }