from flask import Blueprint, jsonify, url_for, request
from models import Product

product_api = Blueprint('product_api', __name__)

@product_api.route('/products', methods=['GET'])
def get_all_products():
    # 2nd Navigation Bar with Categories - filtering is done here
    category = request.args.get('category')
    
    try:
        if category and category != 'All':
            products = Product.query.filter_by(category=category).all()
        else:
            products = Product.query.all()

        product_list = [p.to_dict() for p in products]

        # Augment Image URL (No hardcoding of image path)
        for prod_dict in product_list:
            if prod_dict['image_url']:
                prod_dict['image_url'] = url_for('serve_upload',
                                                filename=prod_dict['image_url'],
                                                _external=True)

        return jsonify(product_list), 200
    except Exception as e:
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

@product_api.route('/products/<int:product_id>', methods=['GET'])
def get_product_details(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        prod_dict = product.to_dict()

        if prod_dict['image_url']:
            prod_dict['image_url'] = url_for('serve_upload',
                                            filename=prod_dict['image_url'],
                                            _external=True)

        return jsonify(prod_dict), 200

    except Exception as e:
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500