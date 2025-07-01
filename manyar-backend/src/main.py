import os
import sys
# DON'T CHANGE THIS PATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.product import product_bp
from src.routes.admin import admin_bp

def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='')
    
    # Enable CORS for all routes
    CORS(app, origins='*')
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    # Use instance folder for database to ensure persistence
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///manyar.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(product_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')
    
    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory('src/static/uploads', filename)
    
    # Create tables and initialize data
    with app.app_context():
        db.create_all()
        
        # Import models to ensure they're registered
        from src.models.product import Category, Product, ContactMessage, Admin
        from src.models.product_image import ProductImage
        
        # Initialize default categories if they don't exist
        if Category.query.count() == 0:
            categories = [
                {
                    'name_ar': 'خدمات تقنية متكاملة',
                    'name_en': 'Integrated Technical Services',
                    'description_ar': 'صيانة حواسيب، خدمات برمجية، تركيب شبكات، ودعم فني متخصص',
                    'description_en': 'Computer maintenance, software services, network installation, and specialized technical support',
                    'icon': 'wrench',
                    'whatsapp_link': 'https://wa.me/message/HWIIVWSQTBZXM1',
                    'phone_number': '+963947993132'
                },
                {
                    'name_ar': 'بيع وشراء الحواسيب',
                    'name_en': 'Computer Sales & Purchase',
                    'description_ar': 'أجهزة جديدة ومستعملة، شاشات، طابعات، لوحات مفاتيح وإكسسوارات',
                    'description_en': 'New and used devices, monitors, printers, keyboards and accessories',
                    'icon': 'computer',
                    'whatsapp_link': 'https://wa.me/message/HWIIVWSQTBZXM1',
                    'phone_number': '+963947993132'
                },
                {
                    'name_ar': 'خدمات الطباعة والقرطاسية',
                    'name_en': 'Printing & Stationery Services',
                    'description_ar': 'طباعة أبحاث، دفاتر، أطروحات، تصوير ملخصات وبيع قرطاسية جامعية',
                    'description_en': 'Research printing, notebooks, theses, summary copying and university stationery sales',
                    'icon': 'printer',
                    'whatsapp_link': 'https://wa.me/963969597967',
                    'phone_number': '+963969597967'
                },
                {
                    'name_ar': 'مواد التجميل والعناية',
                    'name_en': 'Beauty & Care Products',
                    'description_ar': 'منتجات عناية أصلية، ماركات موثوقة للبشرة والشعر والعطورات',
                    'description_en': 'Original care products, trusted brands for skin, hair and perfumes',
                    'icon': 'sparkles',
                    'whatsapp_link': 'https://wa.me/963936086895',
                    'phone_number': '+963936086895'
                }
            ]
            
            for cat_data in categories:
                category = Category(**cat_data)
                db.session.add(category)
            
            db.session.commit()
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

@app.route('/', defaults={'path': ''}) 
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

