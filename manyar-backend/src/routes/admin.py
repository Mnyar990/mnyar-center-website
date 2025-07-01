from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from src.models.product import Admin, db
import functools

admin_bp = Blueprint('admin', __name__)

def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    admin = Admin.query.filter_by(username=username, is_active=True).first()
    
    if admin and check_password_hash(admin.password_hash, password):
        session['admin_id'] = admin.id
        admin.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'admin': admin.to_dict()
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@admin_bp.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    session.pop('admin_id', None)
    return jsonify({'message': 'Logout successful'})

@admin_bp.route('/auth/me', methods=['GET'])
@login_required
def get_current_admin():
    admin = Admin.query.get(session['admin_id'])
    if not admin or not admin.is_active:
        session.pop('admin_id', None)
        return jsonify({'error': 'Admin not found or inactive'}), 401
    
    return jsonify(admin.to_dict())

@admin_bp.route('/auth/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password required'}), 400
    
    admin = Admin.query.get(session['admin_id'])
    
    if not check_password_hash(admin.password_hash, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})

# Admin management routes (for super admin)
@admin_bp.route('/admins', methods=['GET'])
@login_required
def get_admins():
    admins = Admin.query.all()
    return jsonify([admin.to_dict() for admin in admins])

@admin_bp.route('/admins', methods=['POST'])
@login_required
def create_admin():
    data = request.json
    
    if Admin.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if Admin.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    admin = Admin(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(admin)
    db.session.commit()
    
    return jsonify(admin.to_dict()), 201

@admin_bp.route('/admins/<int:admin_id>', methods=['PUT'])
@login_required
def update_admin(admin_id):
    admin = Admin.query.get_or_404(admin_id)
    data = request.json
    
    # Check if username is being changed and if it already exists
    if 'username' in data and data['username'] != admin.username:
        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        admin.username = data['username']
    
    # Check if email is being changed and if it already exists
    if 'email' in data and data['email'] != admin.email:
        if Admin.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        admin.email = data['email']
    
    if 'is_active' in data:
        admin.is_active = data['is_active']
    
    if 'password' in data and data['password']:
        admin.password_hash = generate_password_hash(data['password'])
    
    db.session.commit()
    return jsonify(admin.to_dict())

@admin_bp.route('/admins/<int:admin_id>', methods=['DELETE'])
@login_required
def delete_admin(admin_id):
    # Prevent deleting self
    if admin_id == session['admin_id']:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    admin = Admin.query.get_or_404(admin_id)
    db.session.delete(admin)
    db.session.commit()
    return '', 204

# Initialize default admin
@admin_bp.route('/init', methods=['POST'])
def init_admin():
    # Check if any admin exists
    if Admin.query.first():
        return jsonify({'error': 'Admin already exists'}), 400
    
    # Create default admin
    admin = Admin(
        username='admin',
        email='admin@manyar.com',
        password_hash=generate_password_hash('admin123'),
        is_active=True
    )
    
    db.session.add(admin)
    db.session.commit()
    
    return jsonify({
        'message': 'Default admin created successfully',
        'username': 'admin',
        'password': 'admin123'
    }), 201

