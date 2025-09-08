import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://almasya.com/api';
export const FILE_BASE_URL = process.env.NEXT_PUBLIC_FILE_BASE_URL || 'https://almasya.com/uploads/';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/auth/profile', data),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; search?: string; currency?: string; page?: number; limit?: number; best?: boolean }) =>
    api.get('/products', { params }),
  
  getById: (id: string) => api.get(`/products/${id}`),
  
  getCategories: () => api.get('/products/categories/all'),
  
  getCurrencies: () => api.get('/products/currencies/all'),
  getActiveCurrency: () => api.get('/products/active-currency'),
};

// Orders API (user)
export const ordersAPI = {
  create: (data: { items: Array<{ productId: string; quantity: number }>; currencyId: string; shippingAddress?: any; notes?: string }) =>
    api.post('/orders', data),
  my: () => api.get('/orders/my'),
  cancel: (orderId: string) => api.post(`/orders/${orderId}/cancel`),
};

// Contact API
export const contactAPI = {
  submit: (data: { name: string; email: string; message: string; phone?: string }) =>
    api.post('/contact', data),
};

// Admin API
export const adminAPI = {
  // Orders
  getOrders: (status?: string) => api.get('/admin/orders', { params: { status } }),
  updateOrderStatus: (orderId: string, status: string) => api.put(`/admin/orders/${orderId}/status`, { status }),
  
  // Products
  getProducts: () => api.get('/admin/products'),
  
  createProduct: (data: any) => {
    if (typeof FormData !== 'undefined' && !(data instanceof FormData)) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v as any));
      return api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  updateProduct: (productId: string, data: any) => {
    if (typeof FormData !== 'undefined' && !(data instanceof FormData)) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v as any));
      return api.put(`/admin/products/${productId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/admin/products/${productId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  deleteProduct: (productId: string) => api.delete(`/admin/products/${productId}`),
  
  // Categories
  getCategories: () => api.get('/admin/categories'),
  
  createCategory: (data: any) => {
    if (typeof FormData !== 'undefined' && !(data instanceof FormData)) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v as any));
      return api.post('/admin/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/admin/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  updateCategory: (categoryId: string, data: any) => {
    if (typeof FormData !== 'undefined' && !(data instanceof FormData)) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v as any));
      return api.put(`/admin/categories/${categoryId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/admin/categories/${categoryId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  deleteCategory: (categoryId: string) => api.delete(`/admin/categories/${categoryId}`),
  
  // Users
  getUsers: () => api.get('/admin/users'),
  
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/admin/users', data),
  
  updateUser: (userId: string, data: { name?: string; email?: string; role?: string; isActive?: boolean }) =>
    api.put(`/admin/users/${userId}`, data),
  
  updateUserRole: (userId: string, role: string) =>
    api.put(`/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  
  // Currencies
  getCurrencies: () => api.get('/admin/currencies'),
  activateCurrency: (currencyId: string) => api.put(`/admin/currencies/${currencyId}/activate`),
  
  createCurrency: (data: any) => api.post('/admin/currencies', data),
  
  updateCurrency: (currencyId: string, data: any) =>
    api.put(`/admin/currencies/${currencyId}`, data),
  
  deleteCurrency: (currencyId: string) => api.delete(`/admin/currencies/${currencyId}`),

  // Offers
  createOffer: (data: { name: string; percentage: number; scope: 'all' | 'category' | 'products'; category?: string; products?: string[]; startDate?: Date; endDate?: Date }) =>
    api.post('/offers', data),
  listOffers: () => api.get('/offers'),
  updateOffer: (offerId: string, data: any) => api.put(`/offers/${offerId}`, data),
  deleteOffer: (offerId: string) => api.delete(`/offers/${offerId}`),
  toggleOffer: (offerId: string) => api.patch(`/offers/${offerId}/toggle`),

  // Coupons
  createCoupon: (data: any) => api.post('/coupons', data),
  getCoupons: () => api.get('/coupons'),
  listCoupons: () => api.get('/coupons'),
  updateCoupon: (couponId: string, data: any) => api.put(`/coupons/${couponId}`, data),
  deleteCoupon: (couponId: string) => api.delete(`/coupons/${couponId}`),
  toggleCoupon: (couponId: string) => api.patch(`/coupons/${couponId}/toggle`),
  validateCoupon: (data: { code: string; orderAmount?: number; productIds?: string[] }) => api.post('/coupons/validate', data),
  applyCoupon: (couponId: string) => api.post(`/coupons/${couponId}/apply`),
  
  // Newsletter
  getNewsletterSubscribers: () => api.get('/newsletter/subscribers'),
  sendNewsletter: (data: { subject: string; html: string }) => api.post('/newsletter/send', data),
  
  // Contacts
  getContacts: () => {
    console.log('📧 API: Getting contacts...');
    return api.get('/contact');
  },
  markContactAsRead: (contactId: string) => api.put(`/contact/${contactId}/read`),
  markContactAsReplied: (contactId: string) => api.put(`/contact/${contactId}/replied`),
};

// Reviews API
export const reviewsAPI = {
  listByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  upsertMyReview: (productId: string, data: { rating: number; comment: string }) =>
    api.post(`/reviews/product/${productId}`, data),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
  listSubscribers: () => api.get('/newsletter/subscribers'),
  send: (data: { subject: string; html: string }) => api.post('/newsletter/send', data),
};

// Wishlist API
export const wishlistAPI = {
  getMy: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

// Coupon API (public)
export const couponAPI = {
  validate: (data: { code: string; orderAmount?: number; productIds?: string[] }) => api.post('/coupons/validate', data),
  apply: (couponId: string) => api.post(`/coupons/${couponId}/apply`),
};

export default api;