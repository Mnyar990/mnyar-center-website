import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import ServicePages from './components/ServicePages.jsx'
import {
  Computer,
  Printer,
  Sparkles,
  Wrench,
  Monitor,
  Keyboard,
  Palette,
  Phone,
  Mail,
  MapPin,
  Star,
  MessageCircle,
  Globe,
  Menu,
  X,
  ChevronRight,
  Heart,
  Shield,
  Zap,
  Users,
  Settings
} from 'lucide-react'
import './App.css'
import logo from './assets/logo.jpg'

const API_BASE = "https://kkh7ikcgw9q1.manus.space/api"

function App() {
  const [language, setLanguage] = useState('ar')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'category_id'
  const [categories, setCategories] = useState([])
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const submitContactForm = async (e) => {
    e.preventDefault()
    setContactLoading(true)
    
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      })
      
      if (response.ok) {
        alert(language === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!')
        setContactForm({ name: '', email: '', message: '' })
      } else {
        alert(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message')
      }
    } catch (error) {
      alert(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message')
    } finally {
      setContactLoading(false)
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
    document.documentElement.lang = language === 'ar' ? 'en' : 'ar'
    document.documentElement.dir = language === 'ar' ? 'ltr' : 'rtl'
  }

  // Check for admin access
  useEffect(() => {
    const checkAdminAccess = () => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('admin') === 'true') {
        setShowAdmin(true)
      }
    }
    checkAdminAccess()
  }, [])

  if (showAdmin) {
    return <AdminPanel />
  }

  if (currentPage !== 'home') {
    return (
      <ServicePages 
        categoryId={currentPage} 
        language={language} 
        onBack={() => setCurrentPage('home')} 
      />
    )
  }

  const content = {
    ar: {
      nav: {
        home: 'الرئيسية',
        services: 'خدماتنا',
        about: 'من نحن',
        contact: 'اتصل بنا'
      },
      hero: {
        title: 'مركز منيار للخدمات التقنية',
        subtitle: 'شريكك الموثوق في عالم التكنولوجيا والخدمات المتكاملة',
        description: 'نقدم خدمات تقنية متطورة، بيع وشراء الحواسيب، خدمات الطباعة والقرطاسية، ومنتجات التجميل والعناية بأعلى جودة وأفضل الأسعار',
        cta: 'تواصل معنا الآن'
      },
      services: {
        title: 'خدماتنا المتميزة',
        subtitle: 'نقدم مجموعة شاملة من الخدمات التقنية والتجارية لتلبية جميع احتياجاتكم',
        bookNow: 'احجز الآن عبر واتساب'
      },
      about: {
        title: 'من نحن',
        description: 'مركز منيار للخدمات التقنية هو وجهتكم الأولى للحصول على خدمات تقنية متطورة ومنتجات عالية الجودة. نحن نفخر بتقديم خدمات متنوعة تشمل الخدمات التقنية، بيع وشراء الحواسيب، خدمات الطباعة والقرطاسية، ومنتجات التجميل والعناية.',
        values: [
          { title: 'الجودة', description: 'نلتزم بتقديم أعلى معايير الجودة في جميع خدماتنا ومنتجاتنا' },
          { title: 'الثقة', description: 'نبني علاقات طويلة الأمد مع عملائنا القائمة على الثقة والشفافية' },
          { title: 'الابتكار', description: 'نواكب أحدث التطورات التقنية لنقدم حلولاً مبتكرة ومتطورة' },
          { title: 'الخدمة', description: 'فريق متخصص يقدم خدمة عملاء متميزة على مدار الساعة' }
        ]
      },
      contact: {
        title: 'اتصل بنا',
        subtitle: 'نحن هنا لخدمتكم، تواصلوا معنا عبر الطرق التالية',
        tech: 'للخدمات التقنية وبيع الحواسيب',
        printing: 'لخدمات الطباعة والقرطاسية',
        beauty: 'لمنتجات التجميل والعناية',
        form: {
          name: 'الاسم',
          email: 'البريد الإلكتروني',
          message: 'الرسالة',
          send: 'إرسال الرسالة'
        }
      },
      footer: {
        description: 'مركز منيار للخدمات التقنية - شريكك الموثوق في عالم التكنولوجيا',
        quickLinks: 'روابط سريعة',
        services: 'خدماتنا',
        rights: 'جميع الحقوق محفوظة'
      }
    },
    en: {
      nav: {
        home: 'Home',
        services: 'Services',
        about: 'About',
        contact: 'Contact'
      },
      hero: {
        title: 'Mnyar Technical Services Center',
        subtitle: 'Your trusted partner in technology and integrated services',
        description: 'We provide advanced technical services, computer sales and purchases, printing and stationery services, and beauty and care products with the highest quality and best prices',
        cta: 'Contact Us Now'
      },
      services: {
        title: 'Our Distinguished Services',
        subtitle: 'We provide a comprehensive range of technical and commercial services to meet all your needs',
        bookNow: 'Book Now via WhatsApp'
      },
      about: {
        title: 'About Us',
        description: 'Mnyar Technical Services Center is your first destination for advanced technical services and high-quality products. We pride ourselves on providing diverse services including technical services, computer sales and purchases, printing and stationery services, and beauty and care products.',
        values: [
          { title: 'Quality', description: 'We are committed to providing the highest quality standards in all our services and products' },
          { title: 'Trust', description: 'We build long-term relationships with our customers based on trust and transparency' },
          { title: 'Innovation', description: 'We keep up with the latest technical developments to provide innovative and advanced solutions' },
          { title: 'Service', description: 'A specialized team provides excellent customer service around the clock' }
        ]
      },
      contact: {
        title: 'Contact Us',
        subtitle: 'We are here to serve you, contact us through the following methods',
        tech: 'For technical services and computer sales',
        printing: 'For printing and stationery services',
        beauty: 'For beauty and care products',
        form: {
          name: 'Name',
          email: 'Email',
          message: 'Message',
          send: 'Send Message'
        }
      },
      footer: {
        description: 'Mnyar Technical Services Center - Your trusted partner in technology',
        quickLinks: 'Quick Links',
        services: 'Services',
        rights: 'All rights reserved'
      }
    }
  }

  const currentContent = content[language]

  const Header = () => (
    <header className="bg-white/95 backdrop-blur-sm border-b border-golden/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <img src={logo} alt="Manyar Logo" className="h-12 w-12 rounded-full" />
            <div>
              <h1 className="text-xl font-bold golden-text font-arabic">مركز منيار</h1>
              <p className="text-sm text-muted-foreground font-arabic">للخدمات التقنية</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
              {currentContent.nav.home}
            </a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
              {currentContent.nav.services}
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              {currentContent.nav.about}
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
              {currentContent.nav.contact}
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLanguage}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Globe className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'EN' : 'عربي'}
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-foreground hover:text-primary transition-colors font-medium">
                {currentContent.nav.home}
              </a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors font-medium">
                {currentContent.nav.services}
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
                {currentContent.nav.about}
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
                {currentContent.nav.contact}
              </a>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleLanguage}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-fit"
              >
                <Globe className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {language === 'ar' ? 'EN' : 'عربي'}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )

  const HeroSection = () => (
    <section id="home" className="hero-section py-20 text-white relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="golden-text">{currentContent.hero.title}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-medium">
                {currentContent.hero.subtitle}
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                {currentContent.hero.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="whatsapp-btn text-white font-semibold px-8 py-4 text-lg"
                onClick={() => window.open(categories.find(cat => cat.name_en === 'Integrated Technical Services')?.whatsapp_link || '#', '_blank')}
              >
                <MessageCircle className="w-6 h-6 mr-3 rtl:ml-3 rtl:mr-0" />
                {currentContent.hero.cta}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg"
              >
                <ChevronRight className="w-6 h-6 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
                {currentContent.nav.services}
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="floating-animation">
              <img 
                src={logo} 
                alt="Manyar Logo" 
                className="w-80 h-80 mx-auto rounded-full shadow-2xl pulse-golden"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const ServicesSection = () => (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 golden-text">
            {currentContent.services.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {currentContent.services.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map(category => (
            <Card 
              key={category.id} 
              className="flex flex-col items-center text-center p-6 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setCurrentPage(category.id)}
            >
              <div className="text-golden mb-4">
                {category.icon === 'wrench' && <Wrench className="w-12 h-12" />}
                {category.icon === 'computer' && <Computer className="w-12 h-12" />}
                {category.icon === 'printer' && <Printer className="w-12 h-12" />}
                {category.icon === 'sparkles' && <Sparkles className="w-12 h-12" />}
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-2">
                  {language === 'ar' ? category.name_ar : category.name_en}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {language === 'ar' ? category.description_ar : category.description_en}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <Button 
                  size="sm" 
                  className="whatsapp-btn text-white font-semibold px-4 py-2 text-base"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from triggering
                    window.open(category.whatsapp_link || `https://wa.me/${category.phone_number}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentContent.services.bookNow}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )

  const AboutSection = () => (
    <section id="about" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 golden-text">
            {currentContent.about.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {currentContent.about.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentContent.about.values.map((value, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-golden mb-4">
                {index === 0 && <Star className="w-12 h-12" />}
                {index === 1 && <Heart className="w-12 h-12" />}
                {index === 2 && <Zap className="w-12 h-12" />}
                {index === 3 && <Shield className="w-12 h-12" />}
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-2">
                  {value.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {value.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )

  const ContactSection = () => (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 golden-text">
            {currentContent.contact.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {currentContent.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <Card className="p-6 shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">
                  {currentContent.contact.tech}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-6 h-6 text-golden" />
                  <span className="text-lg text-foreground">{categories.find(cat => cat.name_en === 'Integrated Technical Services')?.phone_number || '+963947993132'}</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <MessageCircle className="w-6 h-6 text-golden" />
                  <a 
                    href={categories.find(cat => cat.name_en === 'Integrated Technical Services')?.whatsapp_link || 'https://wa.me/message/HWIIVWSQTBZXM1'}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg text-blue-600 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">
                  {currentContent.contact.printing}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-6 h-6 text-golden" />
                  <span className="text-lg text-foreground">{categories.find(cat => cat.name_en === 'Printing & Stationery Services')?.phone_number || '+963969597967'}</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <MessageCircle className="w-6 h-6 text-golden" />
                  <a 
                    href={categories.find(cat => cat.name_en === 'Printing & Stationery Services')?.whatsapp_link || 'https://wa.me/963969597967'}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg text-blue-600 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold mb-4">
                  {currentContent.contact.beauty}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-6 h-6 text-golden" />
                  <span className="text-lg text-foreground">{categories.find(cat => cat.name_en === 'Beauty & Care Products')?.phone_number || '+963936086895'}</span>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <MessageCircle className="w-6 h-6 text-golden" />
                  <a 
                    href={categories.find(cat => cat.name_en === 'Beauty & Care Products')?.whatsapp_link || 'https://wa.me/963936086895'}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg text-blue-600 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-6 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold mb-4">{currentContent.contact.form.send}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitContactForm} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="sr-only">{currentContent.contact.form.name}</Label>
                  <Input 
                    id="name" 
                    placeholder={currentContent.contact.form.name} 
                    value={contactForm.name} 
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="sr-only">{currentContent.contact.form.email}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder={currentContent.contact.form.email} 
                    value={contactForm.email} 
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="sr-only">{currentContent.contact.form.message}</Label>
                  <Textarea 
                    id="message" 
                    placeholder={currentContent.contact.form.message} 
                    rows="5" 
                    value={contactForm.message} 
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={contactLoading}>
                  {contactLoading ? 'Sending...' : currentContent.contact.form.send}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )

  const Footer = () => (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">مركز منيار</h3>
            <p className="text-gray-400">
              {currentContent.footer.description}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{currentContent.footer.quickLinks}</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-golden transition-colors">{currentContent.nav.home}</a></li>
              <li><a href="#services" className="hover:text-golden transition-colors">{currentContent.nav.services}</a></li>
              <li><a href="#about" className="hover:text-golden transition-colors">{currentContent.nav.about}</a></li>
              <li><a href="#contact" className="hover:text-golden transition-colors">{currentContent.nav.contact}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{currentContent.footer.services}</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <a 
                    href="#" 
                    onClick={() => setCurrentPage(category.id)} 
                    className="hover:text-golden transition-colors"
                  >
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} {currentContent.footer.rights}.</p>
        </div>
      </div>
    </footer>
  )

  return (
    <div className="App">
      <Header />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

export default App


