import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Computer,
  Printer,
  Sparkles,
  Wrench,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Star,
  ShoppingCart,
  Package,
  Globe,
  X
} from 'lucide-react'
import logo from '../assets/logo.jpg'

const API_BASE = "https://kkh7ikcgw9q1.manus.space/api"

function ServicePages({ categoryId, language, onBack }) {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    loadServiceData()
  }, [categoryId])

  const loadServiceData = async () => {
    try {
      setLoading(true)
      
      // Load categories first
      const categoriesResponse = await fetch(`${API_BASE}/categories`)
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json()
        const currentCategory = categories.find(cat => cat.id === categoryId)
        setCategory(currentCategory)
        
        // Load products for this category
        if (currentCategory) {
          const productsResponse = await fetch(`${API_BASE}/products?category_id=${currentCategory.id}&is_active=true`)
          if (productsResponse.ok) {
            const productsData = await productsResponse.json()
            setProducts(productsData.products || [])
          }
        }
      }
    } catch (error) {
      console.error('Failed to load service data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = () => {
    if (!category) return <Package className="w-8 h-8 text-white" />
    switch (category.icon) {
      case 'wrench':
        return <Wrench className="w-8 h-8 text-white" />
      case 'computer':
        return <Computer className="w-8 h-8 text-white" />
      case 'printer':
        return <Printer className="w-8 h-8 text-white" />
      case 'sparkles':
        return <Sparkles className="w-8 h-8 text-white" />
      default:
        return <Package className="w-8 h-8 text-white" />
    }
  }

  const handleWhatsAppBooking = (product) => {
    if (!category) return
    
    const message = language === 'ar' 
      ? `مرحباً، أريد حجز: ${product.name_ar}`
      : `Hello, I want to book: ${product.name_en}`
    
    const whatsappUrl = `${category.whatsapp_link || `https://wa.me/${category.phone_number}`}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const content = {
    ar: {
      back: 'العودة للرئيسية',
      loading: 'جاري التحميل...',
      noProducts: 'لا توجد منتجات متاحة حالياً',
      bookNow: 'احجز الآن',
      price: 'السعر',
      originalPrice: 'السعر الأصلي',
      discount: 'خصم',
      featured: 'مميز',
      outOfStock: 'غير متوفر',
      inStock: 'متوفر',
      details: 'التفاصيل',
      close: 'إغلاق',
      contactPhone: 'رقم التواصل'
    },
    en: {
      back: 'Back to Home',
      loading: 'Loading...',
      noProducts: 'No products available currently',
      bookNow: 'Book Now',
      price: 'Price',
      originalPrice: 'Original Price',
      discount: 'Discount',
      featured: 'Featured',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      details: 'Details',
      close: 'Close',
      contactPhone: 'Contact Phone'
    }
  }

  const currentContent = content[language]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">{currentContent.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'ar' ? 'font-arabic' : 'font-english'}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <img src={logo} alt="Mnyar Logo" className="h-12 w-12 rounded-full" />
              <div>
                <h1 className="text-xl font-bold golden-text font-arabic">مركز منيار</h1>
                <p className="text-sm text-muted-foreground font-arabic">للخدمات التقنية</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {language === 'ar' ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
              {currentContent.back}
            </Button>
          </div>
        </div>
      </header>

      {/* Service Header */}
      {category && (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 golden-gradient rounded-full flex items-center justify-center">
                {getServiceIcon()}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 golden-text">
                {language === 'ar' ? category.name_ar : category.name_en}
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {language === 'ar' ? category.description_ar : category.description_en}
              </p>
              <div className="mt-6 flex items-center justify-center space-x-4 rtl:space-x-reverse">
                <Badge variant="outline" className="border-primary text-primary">
                  {category.phone_number}
                </Badge>
                <Button 
                  className="whatsapp-btn text-white"
                  onClick={() => window.open(category.whatsapp_link || `https://wa.me/${category.phone_number}`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  واتساب
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {currentContent.noProducts}
              </h3>
              <p className="text-gray-500">
                {language === 'ar' 
                  ? 'سيتم إضافة المنتجات قريباً' 
                  : 'Products will be added soon'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="service-card h-full overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.image_url && (
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={language === 'ar' ? product.name_ar : product.name_en}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">
                        {language === 'ar' ? product.name_ar : product.name_en}
                      </CardTitle>
                      <div className="flex flex-col items-end space-y-1">
                        {product.is_featured && (
                          <Badge className="golden-gradient text-white text-xs">
                            {currentContent.featured}
                          </Badge>
                        )}
                        {product.stock_quantity === 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {currentContent.outOfStock}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {(product.description_ar || product.description_en) && (
                      <CardDescription className="text-sm line-clamp-2">
                        {language === 'ar' ? product.description_ar : product.description_en}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {product.price && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <span className="text-2xl font-bold text-primary">
                            {product.price.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SYP'}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {product.discount_percentage > 0 && (
                          <Badge variant="destructive" className="mt-1">
                            {currentContent.discount} {product.discount_percentage}%
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full whatsapp-btn text-white"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click from triggering modal
                        handleWhatsAppBooking(product);
                      }}
                      disabled={product.stock_quantity === 0}
                    >
                      <MessageCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {currentContent.bookNow}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="p-6">
              {selectedProduct.image_url && (
                <img 
                  src={selectedProduct.image_url} 
                  alt={language === 'ar' ? selectedProduct.name_ar : selectedProduct.name_en}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
              )}
              <h2 className="text-3xl font-bold golden-text mb-2">
                {language === 'ar' ? selectedProduct.name_ar : selectedProduct.name_en}
              </h2>
              <p className="text-muted-foreground mb-4">
                {language === 'ar' ? selectedProduct.description_ar : selectedProduct.description_en}
              </p>
              
              {selectedProduct.price && (
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {selectedProduct.price.toLocaleString()} {language === 'ar' ? 'ل.س' : 'SYP'}
                  </span>
                  {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {selectedProduct.original_price.toLocaleString()}
                    </span>
                  )}
                  {selectedProduct.discount_percentage > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {currentContent.discount} {selectedProduct.discount_percentage}%
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Phone className="w-5 h-5 text-golden" />
                <span className="text-lg text-foreground">{selectedProduct.phone_number || category?.phone_number}</span>
              </div>

              <Button 
                className="w-full whatsapp-btn text-white"
                onClick={() => handleWhatsAppBooking(selectedProduct)}
                disabled={selectedProduct.stock_quantity === 0}
              >
                <MessageCircle className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentContent.bookNow}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicePages


