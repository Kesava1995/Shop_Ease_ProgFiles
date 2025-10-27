import os
from functools import wraps
from flask import Blueprint, request, jsonify, current_app, make_response # Added make_response
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request # Added verify_jwt_in_request
from werkzeug.utils import secure_filename
from extensions import db
from models import Product, User

admin_api = Blueprint('admin_api', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- UPDATED ADMIN DECORATOR ---
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 1. Explicitly handle OPTIONS preflight before any JWT checks
        if request.method == 'OPTIONS':
            response = make_response()
            response.status_code = 204
            return response

        # 2. For non-OPTIONS requests, verify JWT and admin status
        try:
            verify_jwt_in_request()
            current_user_id_str = get_jwt_identity()
            try:
                current_user_id = int(current_user_id_str)
            except (ValueError, TypeError):
                 return jsonify({"error": "Invalid user identity format in token"}), 401
            user = User.query.get(current_user_id)
            if not (user and user.is_admin):
                return jsonify({"error": "Admin access required"}), 403
        except Exception as e:
            print(f"DEBUG: JWT Verification Exception: {type(e).__name__} - {str(e)}")
            return jsonify({"error": f"Authentication Error: {str(e)}"}), 401
        return current_app.ensure_sync(fn)(*args, **kwargs)
    return wrapper
# --- END UPDATED DECORATOR ---

@admin_api.route('/products', methods=['POST', 'OPTIONS'])
@admin_required
def create_product():
    # --- ADDED DETAILED LOGGING AT THE VERY START ---
    print("\n--- ENTERING CREATE_PRODUCT ---")
    print("Request Method:", request.method)
    print("Request Headers:", request.headers)

    # Check if form data parsing works AT ALL
    form_data = None # Initialize
    try:
        # Accessing request.form triggers parsing of multipart/form-data
        form_data = request.form
        print("Request Form Data:", form_data)
    except Exception as e:
        print(f"!!! ERROR ACCESSING request.form: {type(e).__name__} - {e}")
        return jsonify({"error": "Failed to parse form data on server."}), 400

    # Check if file data parsing works
    file_data = None # Initialize
    try:
        # Accessing request.files triggers file part parsing
        file_data = request.files
        print("Request Files Data:", file_data)
        image_file = file_data.get('image') # Try getting the specific file
        if image_file:
            print(f"Image File Received: filename='{image_file.filename}', content_type='{image_file.content_type}'")
        else:
             print("!!! No 'image' file found in request.files")
             # Server-side check for missing file
             # return jsonify({"error": "Image file missing in request."}), 400 # Enable this if client validation isn't enough
    except Exception as e:
        print(f"!!! ERROR ACCESSING request.files: {type(e).__name__} - {e}")
        return jsonify({"error": "Failed to parse file data on server."}), 400
    # --- END DETAILED LOGGING ---

    # NOTE: The OPTIONS check inside the function is removed because the decorator handles it now.

    # --- Proceed with existing logic IF parsing above succeeded ---
    try:
        # Use the parsed form_data variable
        name = form_data.get('name')
        description = form_data.get('description')
        price_str = form_data.get('price')
        stock_str = form_data.get('stock')
        category = form_data.get('category')

        print(f"Extracted Fields: Name={name}, Desc={description}, Price={price_str}, Stock={stock_str}, Cat={category}")

        if not all([name, description, price_str, stock_str, category]):
            print("!!! Validation Failed: Missing required text/selection fields.")
            return jsonify({"error": "Missing required text or selection fields"}), 400

        try:
            price_float = float(price_str)
            if price_float <= 0: raise ValueError("Price must be positive.")
        except (ValueError, TypeError):
            print("!!! Validation Failed: Invalid price format.")
            return jsonify({"error": "Invalid price format. Must be a positive number."}), 400

        try:
            stock_int = int(stock_str)
            if stock_int < 0: raise ValueError("Stock cannot be negative.")
        except (ValueError, TypeError):
            print("!!! Validation Failed: Invalid stock format.")
            return jsonify({"error": "Invalid stock format. Must be a non-negative integer."}), 400

        image_filename = None
        # Use the parsed file_data variable
        file = file_data.get('image')
        if file:
            if file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(save_path)
                image_filename = filename
                print(f"Image saved as: {filename}")
            elif file.filename != '':
                 print("!!! Validation Failed: Invalid image file type.")
                 return jsonify({"error": "Invalid image file type. Allowed: png, jpg, jpeg, webp"}), 400
        else:
             print("!!! Validation Failed: Image file is required.")
             return jsonify({"error": "Image file is required."}), 400

        print("Validation Passed. Creating product...")
        new_product = Product(
            name=name, description=description, price=price_float, stock=stock_int,
            image_url=image_filename, category=category
        )

        db.session.add(new_product)
        db.session.commit()
        print("Product created successfully. ID:", new_product.id)
        return jsonify(new_product.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        print(f"!!! FINAL EXCEPTION CAUGHT: {type(e).__name__} - {e}")
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

# Ensure other admin routes also use the updated decorator logic if needed
@admin_api.route('/products/<int:product_id>', methods=['DELETE', 'OPTIONS']) # Added OPTIONS
@admin_required
def delete_product(product_id):
    # The decorator handles OPTIONS, no need for explicit check here if using standard methods
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        if product.image_url:
            try:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], product.image_url)
                if os.path.exists(image_path):
                    os.remove(image_path)
            except Exception as e:
                print(f"Warning: Could not delete image file {product.image_url}: {e}")

        db.session.delete(product)
        db.session.commit()

        return jsonify({"message": f"Product '{product.name}' deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error during product deletion: {e}")
        return jsonify({"error": "An internal server error occurred during deletion", "details": str(e)}), 500

@admin_api.route('/users', methods=['GET'])
@admin_required
def list_users():
    # Decorator handles OPTIONS if browser sends one for GET (unlikely but safe)
    try:
        users = User.query.all()
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "email": user.email,
                "is_admin": user.is_admin
            })
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500