from flask import Blueprint, jsonify, request
from src.models.product import Product, Category, ContactMessage, db
from src.models.product_image import ProductImage
from src.models.user import User
import os
from werkzeug.utils import secure_filename
import uuid

product_bp = Blueprint('product', __name__)

UPLOAD_FOLDER = 'src/static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

# File upload route
@product_bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        ensure_upload_folder()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = secure_filename(file.filename)
            name, ext = os.path.splitext(filename)
            unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
            
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(filepath)
            
            # Return the URL path
            file_url = f"/uploads/{unique_filename}"
            return jsonify({'file_url': file_url})
        
        return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Category routes
@product_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories])

@product_bp.route('/categories', methods=['POST'])
def create_category():
    data = request.json
    category = Category(
        name_ar=data['name_ar'],
        name_en=data['name_en'],
        description_ar=data.get('description_ar'),
        description_en=data.get('description_en'),
        icon=data.get('icon'),
        whatsapp_link=data.get('whatsapp_link'),
        phone_number=data.get('phone_number')
    )
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201

@product_bp.route('/categories/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.query.get_or_404(category_id)
    return jsonify(category.to_dict())

@product_bp.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.json
    
    category.name_ar = data.get('name_ar', category.name_ar)
    category.name_en = data.get('name_en', category.name_en)
    category.description_ar = data.get('description_ar', category.description_ar)
    category.description_en = data.get('description_en', category.description_en)
    category.icon = data.get('icon', category.icon)
    category.whatsapp_link = data.get('whatsapp_link', category.whatsapp_link)
    category.phone_number = data.get('phone_number', category.phone_number)
    
    db.session.commit()
    return jsonify(category.to_dict())

@product_bp.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return '', 204

# Product routes
@product_bp.route('/products', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_id = request.args.get('category_id', type=int)
    is_featured = request.args.get('is_featured', type=bool)
    is_active = request.args.get('is_active', True, type=bool)
    
    query = Product.query.filter_by(is_active=is_active)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if is_featured is not None:
        query = query.filter_by(is_featured=is_featured)
    
    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': products.has_next,
        'has_prev': products.has_prev
    })

@product_bp.route('/products', methods=['POST'])
def create_product():
    try:
        data = request.json
        product = Product(
            name_ar=data['name_ar'],
            name_en=data['name_en'],
            description_ar=data.get('description_ar'),
            description_en=data.get('description_en'),
            price=data.get('price'),
            original_price=data.get('original_price'),
            image_url=data.get('image_url'),
            is_featured=data.get('is_featured', False),
            is_active=data.get('is_active', True),
            stock_quantity=data.get("stock_quantity", 0),
            phone_number=data.get("phone_number"), # New field
            category_id=data["category_id"]
        )
        db.session.add(product)
        db.session.flush()  # Get the product ID
        
        # Handle multiple images
        images_data = data.get('images', [])
        for i, image_data in enumerate(images_data):
            product_image = ProductImage(
                product_id=product.id,
                image_url=image_data.get('image_url'),
                alt_text=image_data.get('alt_text'),
                is_primary=image_data.get('is_primary', i == 0),
                sort_order=image_data.get('sort_order', i)
            )
            db.session.add(product_image)
        
        db.session.commit()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@product_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict())

@product_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.json
        
        product.name_ar = data.get('name_ar', product.name_ar)
        product.name_en = data.get('name_en', product.name_en)
        product.description_ar = data.get('description_ar', product.description_ar)
        product.description_en = data.get('description_en', product.description_en)
        product.price = data.get('price', product.price)
        product.original_price = data.get('original_price', product.original_price)
        product.image_url = data.get('image_url', product.image_url)
        product.is_featured = data.get('is_featured', product.is_featured)
        product.is_active = data.get('is_active', product.is_active)
        product.stock_quantity = data.get("stock_quantity", product.stock_quantity)
        product.phone_number = data.get("phone_number", product.phone_number) # New field
        product.category_id = data.get("category_id", product.category_id)
        
        # Handle images update
        if 'images' in data:
            # Remove existing images
            ProductImage.query.filter_by(product_id=product.id).delete()
            
            # Add new images
            images_data = data.get('images', [])
            for i, image_data in enumerate(images_data):
                product_image = ProductImage(
                    product_id=product.id,
                    image_url=image_data.get('image_url'),
                    alt_text=image_data.get('alt_text'),
                    is_primary=image_data.get('is_primary', i == 0),
                    sort_order=image_data.get('sort_order', i)
                )
                db.session.add(product_image)
        
        db.session.commit()
        return jsonify(product.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@product_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return '', 204

# Contact message routes
@product_bp.route('/contact', methods=['POST'])
def create_contact_message():
    data = request.json
    message = ContactMessage(
        name=data['name'],
        email=data['email'],
        message=data['message']
    )
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201

@product_bp.route('/contact', methods=['GET'])
def get_contact_messages():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    is_read = request.args.get('is_read', type=bool)
    
    query = ContactMessage.query
    
    if is_read is not None:
        query = query.filter_by(is_read=is_read)
    
    messages = query.order_by(ContactMessage.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'messages': [message.to_dict() for message in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': page,
        'per_page': per_page,
        'has_next': messages.has_next,
        'has_prev': messages.has_prev
    })

@product_bp.route('/contact/<int:message_id>', methods=['PUT'])
def update_contact_message(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    data = request.json
    
    message.is_read = data.get('is_read', message.is_read)
    
    db.session.commit()
    return jsonify(message.to_dict())

@product_bp.route('/contact/<int:message_id>', methods=['DELETE'])
def delete_contact_message(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    db.session.delete(message)
    db.session.commit()
    return '', 204

# Statistics routes
@product_bp.route('/stats', methods=['GET'])
def get_stats():
    total_products = Product.query.count()
    active_products = Product.query.filter_by(is_active=True).count()
    featured_products = Product.query.filter_by(is_featured=True).count()
    total_categories = Category.query.count()
    unread_messages = ContactMessage.query.filter_by(is_read=False).count()
    total_messages = ContactMessage.query.count()
    
    return jsonify({
        'total_products': total_products,
        'active_products': active_products,
        'featured_products': featured_products,
        'total_categories': total_categories,
        'unread_messages': unread_messages,
        'total_messages': total_messages
    })

