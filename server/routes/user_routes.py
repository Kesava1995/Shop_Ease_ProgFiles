from flask import Blueprint, request, jsonify
from extensions import db, bcrypt # Removed 'cors' import since it's not needed here
from models import User, Product, CartItem, WishlistItem
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

user_api = Blueprint('user_api', __name__)

@user_api.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email address already in use"}), 409
            
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(email=email, password_hash=password_hash, is_admin=False) 

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email address already in use"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500


def authenticate_user(email, password, required_admin_status):
    if email is None or password is None:
        return jsonify({"error": "Missing credentials in request body."}), 400 

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    if user.is_admin != required_admin_status:
        role = "Admin" if required_admin_status else "User"
        return jsonify({"error": f"Invalid credentials for a {role} account"}), 401

    user_id_str = str(user.id) 
    print(f"DEBUG: Creating token with STRING identity: {user_id_str}, type: {type(user_id_str)}")
    access_token = create_access_token(identity=user_id_str) 
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "is_admin": user.is_admin
        }
    }), 200

@user_api.route('/login/user', methods=['POST', 'OPTIONS'])
def user_login():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        email = data.get('email') if data else None
        password = data.get('password') if data else None
        
        return authenticate_user(email, password, False)
    except Exception as e:
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

@user_api.route('/login/admin', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        email = data.get('email') if data else None
        password = data.get('password') if data else None
        
        return authenticate_user(email, password, True)
    except Exception as e:
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

@user_api.route('/logout', methods=['POST'])
def logout():
    return jsonify({"message": "Logout successful. Please delete your token."}), 200

@user_api.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()

    return jsonify([item.to_dict() for item in cart_items]), 200

@user_api.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.json
    product_id = data.get('product_id')
    quantity_to_add = data.get('quantity', 1)
    
    if not product_id or not isinstance(quantity_to_add, int) or quantity_to_add <= 0:
        return jsonify({"error": "Invalid product ID or quantity"}), 400
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    cart_item = CartItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    
    if cart_item:
        new_quantity = cart_item.quantity + quantity_to_add
        if new_quantity > product.stock:
            return jsonify({"error": "Not enough stock available"}), 400
        cart_item.quantity = new_quantity
    else:
        if quantity_to_add > product.stock:
            return jsonify({"error": "Not enough stock available"}), 400
        cart_item = CartItem(user_id=current_user_id, product_id=product_id, quantity=quantity_to_add)
        db.session.add(cart_item)

    db.session.commit()
    return jsonify(cart_item.to_dict()), 200

@user_api.route('/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    current_user_id_str = get_jwt_identity()
    try:
        current_user_id = int(current_user_id_str)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid user identity in token"}), 401
    cart_item = CartItem.query.get(item_id)

    if not cart_item:
        return jsonify({"error": "Cart item not found"}), 404
    
    if cart_item.user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Item removed from cart"}), 200

@user_api.route('/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    current_user_id = get_jwt_identity()
    wishlist_items = WishlistItem.query.filter_by(user_id=current_user_id).all()

    return jsonify([item.to_dict() for item in wishlist_items]), 200

@user_api.route('/wishlist', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    current_user_id = get_jwt_identity()
    data = request.json
    product_id = data.get('product_id')
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400
        
    if not Product.query.get(product_id):
        return jsonify({"error": "Product not found"}), 404
        
    existing_item = WishlistItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    if existing_item:
        return jsonify({"error": "Item already in wishlist"}), 409
        
    new_item = WishlistItem(user_id=current_user_id, product_id=product_id)
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@user_api.route('/wishlist/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    current_user_id = get_jwt_identity()

    item = WishlistItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()

    if not item:
        return jsonify({"error": "Item not found in wishlist"}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Item removed from wishlist"}), 200
    
@user_api.route('/cart/<int:item_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_cart_item(item_id):
    if request.method == 'OPTIONS':
        return '', 204

    try:
        current_user_id_str = get_jwt_identity()
        try:
            current_user_id = int(current_user_id_str)
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid user identity in token"}), 401

        cart_item = CartItem.query.get(item_id)

        if not cart_item:
            return jsonify({"error": "Cart item not found"}), 404

        if cart_item.user_id != current_user_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()
        new_quantity = data.get('quantity')

        if not isinstance(new_quantity, int) or new_quantity < 1:
            return jsonify({"error": "Invalid quantity provided"}), 400

        product = Product.query.get(cart_item.product_id)
        if not product:
            return jsonify({"error": "Associated product not found"}), 404
        if new_quantity > product.stock:
            return jsonify({"error": f"Not enough stock available ({product.stock} left)"}), 400

        cart_item.quantity = new_quantity
        db.session.commit()

        return jsonify(cart_item.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating cart item: {e}")
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500
