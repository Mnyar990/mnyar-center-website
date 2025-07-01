import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import {
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  BarChart3,
  Users,
  MessageSquare,
  Package,
  Settings,
  Upload
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Switch } from '@/components/ui/switch.jsx'

const API_BASE = 'https://kkh7ikcgw9q1.manus.space/api'

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState({ username: 'Admin' })
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)

  // Data states
  const [stats, setStats] = useState({})
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [messages, setMessages] = useState([])
  const [admins, setAdmins] = useState([])

  // Form states
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      loadData()
    }
  }, [isLoggedIn, activeTab])

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setIsLoggedIn(false)
      setCurrentAdmin(null)
      setActiveTab('dashboard')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      switch (activeTab) {
        case 'dashboard':
          const statsRes = await fetch(`${API_BASE}/stats`)
          if (statsRes.ok) setStats(await statsRes.json())
          break
        case 'categories':
          const categoriesRes = await fetch(`${API_BASE}/categories`)
          if (categoriesRes.ok) setCategories(await categoriesRes.json())
          break
        case 'products':
          const productsRes = await fetch(`${API_BASE}/products`)
          if (productsRes.ok) {
            const data = await productsRes.json()
            setProducts(data.products || [])
          }
          break
        case 'messages':
          const messagesRes = await fetch(`${API_BASE}/contact`)
          if (messagesRes.ok) {
            const data = await messagesRes.json()
            setMessages(data.messages || [])
          }
          break
        case 'admins':
          const adminsRes = await fetch(`${API_BASE}/admin/admins`, {
            credentials: 'include'
          })
          if (adminsRes.ok) setAdmins(await adminsRes.json())
          break
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCategory = async (categoryData) => {
    try {
      const url = editingCategory
        ? `${API_BASE}/categories/${editingCategory.id}`
        : `${API_BASE}/categories`

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })

      if (response.ok) {
        setShowCategoryForm(false)
        setEditingCategory(null)
        loadData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save category')
      }
    } catch (error) {
      alert('Failed to save category: ' + error.message)
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
      } else {
        alert('Failed to delete category')
      }
    } catch (error) {
      alert('Failed to delete category: ' + error.message)
    }
  }

  const saveProduct = async (productData) => {
    try {
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct.id}`
        : `${API_BASE}/products`

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        setShowProductForm(false)
        setEditingProduct(null)
        loadData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save product')
      }
    } catch (error) {
      alert('Failed to save product: ' + error.message)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('Failed to delete product: ' + error.message)
    }
  }

  const markMessageAsRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  // Category Form Component
  function CategoryForm({ category, onSave, onCancel }) {
    const [formData, setFormData] = useState(category || {
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      icon: '',
      whatsapp_link: '',
      phone_number: ''
    })

    const handleChange = (e) => {
      const { name, value } = e.target
      setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      onSave(formData)
    }

    return (
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_ar" className="text-right">Name (AR)</Label>
              <Input id="name_ar" name="name_ar" value={formData.name_ar} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_en" className="text-right">Name (EN)</Label>
              <Input id="name_en" name="name_en" value={formData.name_en} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description_ar" className="text-right">Description (AR)</Label>
              <Textarea id="description_ar" name="description_ar" value={formData.description_ar} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description_en" className="text-right">Description (EN)</Label>
              <Textarea id="description_en" name="description_en" value={formData.description_en} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Icon</Label>
              <Input id="icon" name="icon" value={formData.icon} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="whatsapp_link" className="text-right">WhatsApp Link</Label>
              <Input id="whatsapp_link" name="whatsapp_link" value={formData.whatsapp_link} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">Phone Number</Label>
              <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // Product Form Component
  function ProductForm({ product, onSave, onCancel, categories }) {
    const [formData, setFormData] = useState(product || {
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: '',
      original_price: '',
      is_featured: false,
      is_active: true,
      stock_quantity: 0,
      category_id: '',
      phone_number: '', // New field
      images: [] // New field for multiple images
    })
    const [newImage, setNewImage] = useState('')

    useEffect(() => {
      if (product) {
        setFormData({
          ...product,
          category_id: product.category_id || '',
          images: product.images || []
        })
      }
    }, [product])

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
    }

    const handleSelectChange = (value) => {
      setFormData({ ...formData, category_id: value })
    }

    const handleImageUpload = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      try {
        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: uploadFormData,
        })
        if (response.ok) {
          const data = await response.json()
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, { image_url: data.file_url, alt_text: file.name, is_primary: prev.images.length === 0 }]
          }))
        } else {
          alert('Failed to upload image')
        }
      } catch (error) {
        alert('Error uploading image: ' + error.message)
      }
    }

    const removeImage = (index) => {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      onSave(formData)
    }

    return (
      <Dialog open={true} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_ar" className="text-right">Name (AR)</Label>
              <Input id="name_ar" name="name_ar" value={formData.name_ar} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name_en" className="text-right">Name (EN)</Label>
              <Input id="name_en" name="name_en" value={formData.name_en} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description_ar" className="text-right">Description (AR)</Label>
              <Textarea id="description_ar" name="description_ar" value={formData.description_ar} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description_en" className="text-right">Description (EN)</Label>
              <Textarea id="description_en" name="description_en" value={formData.description_en} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="original_price" className="text-right">Original Price</Label>
              <Input id="original_price" name="original_price" type="number" step="0.01" value={formData.original_price} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">Phone Number</Label>
              <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category_id" className="text-right">Category</Label>
              <Select onValueChange={handleSelectChange} value={formData.category_id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock_quantity" className="text-right">Stock Quantity</Label>
              <Input id="stock_quantity" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">Is Active</Label>
              <Switch id="is_active" name="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_featured" className="text-right">Is Featured</Label>
              <Switch id="is_featured" name="is_featured" checked={formData.is_featured} onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="images" className="text-right">Images</Label>
              <div className="col-span-3 space-y-2">
                <Input id="images" type="file" multiple onChange={handleImageUpload} />
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img src={image.image_url} alt={image.alt_text} className="w-full h-24 object-cover rounded-md" />
                      <Button type="button" variant="destructive" size="sm" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">مركز منيار للخدمات التقنية</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentAdmin?.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'categories' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('categories')}
            >
              <Package className="w-4 h-4 mr-2" />
              Categories
            </Button>
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('products')}
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Button>
            <Button
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <Button
              variant={activeTab === 'admins' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('admins')}
            >
              <Users className="w-4 h-4 mr-2" />
              Admins
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_products || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.active_products || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_categories || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.unread_messages || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Categories</h2>
                  <Button onClick={() => setShowCategoryForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                <div className="grid gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{category.name_ar} / {category.name_en}</CardTitle>
                            <CardDescription>{category.description_ar}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(category)
                                setShowCategoryForm(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCategory(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <Badge>{category.products_count} products</Badge>
                          <span className="text-sm text-gray-600">{category.phone_number}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Products</h2>
                  <Button onClick={() => setShowProductForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{product.name_ar} / {product.name_en}</CardTitle>
                            <CardDescription>{product.description_ar}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product)
                                setShowProductForm(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4">
                          <Badge>{product.category?.name_ar || 'N/A'}</Badge>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                          {product.price && <span className="text-sm font-bold">{product.price} SYP</span>}
                          {product.phone_number && <span className="text-sm text-gray-600">{product.phone_number}</span>}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {product.images && product.images.map((image, index) => (
                            <img key={index} src={image.image_url} alt={image.alt_text} className="w-full h-24 object-cover rounded-md" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Contact Messages</h2>

                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className={message.is_read ? 'opacity-75' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <span>{message.name}</span>
                              {!message.is_read && <Badge variant="destructive">New</Badge>}
                            </CardTitle>
                            <CardDescription>{message.email}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            {!message.is_read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markMessageAsRead(message.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {message.is_read && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markMessageAsRead(message.id)}
                              >
                                <EyeOff className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this message?')) {
                                  // Implement delete message logic
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{message.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Admins</h2>
                <div className="grid gap-4">
                  {admins.map((admin) => (
                    <Card key={admin.id}>
                      <CardHeader>
                        <CardTitle>{admin.username}</CardTitle>
                        <CardDescription>{admin.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onSave={saveCategory}
          onCancel={() => {
            setShowCategoryForm(false)
            setEditingCategory(null)
          }}
        />
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={saveProduct}
          onCancel={() => {
            setShowProductForm(false)
            setEditingProduct(null)
          }}
          categories={categories}
        />
      )}
    </div>
  )
}

export default AdminPanel


