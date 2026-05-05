# API Debugging Guide - Solusi Insert Data Error

## Masalah yang Ditemukan

API Anda tidak bisa insert data karena beberapa alasan:

### 1. **Tidak Ada Error Handling yang Jelas**
- Tidak ada feedback ketika request gagal
- Sulit mengetahui apakah masalah di frontend atau backend

### 2. **CRUD Operations Tidak Lengkap**
- `posts`, `organizations`, `products`, `agendas` hanya punya `getAll()`
- Tidak ada method `create()`, `update()`, `delete()`

### 3. **Tidak Ada Request/Response Logging**
- Sulit untuk debugging ketika ada masalah
- Tidak tahu data apa yang dikirim ke server

### 4. **Kemungkinan Masalah CORS atau Content-Type**
- Backend mungkin reject request karena header tidak lengkap

---

## Solusi yang Diterapkan

### ✅ 1. Menambahkan Axios Interceptors

```typescript
// Request interceptor - log semua request
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - tangani error dengan baik
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server error (4xx, 5xx)
      const message = error.response.data?.message || error.response.data?.error || 'Terjadi kesalahan pada server';
      alert(`Error ${error.response.status}: ${message}`);
    } else if (error.request) {
      // Tidak ada response dari server
      alert('Tidak dapat terhubung ke server. Pastikan backend berjalan dan CORS dikonfigurasi dengan benar.');
    } else {
      // Error setup request
      alert(`Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);
```

**Manfaat:**
- Semua request/response akan ter-log di console browser
- User akan mendapat alert jika ada error
- Mudah debugging masalah CORS, network, atau backend error

---

### ✅ 2. Menambahkan Content-Type Header

```typescript
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Manfaat:**
- Memastikan backend tahu bahwa kita mengirim JSON
- Mencegah error parsing di backend

---

### ✅ 3. CRUD Operations Lengkap

Semua API sekarang memiliki operasi lengkap:

#### **activitiesApi** ✅
```typescript
export const activitiesApi = {
  getAll: () => api.get('/activities').then((res) => res.data),
  create: (data: unknown) => api.post('/activities', data).then((res) => res.data),
  update: (id: number | string, data: unknown) => api.put(`/activities/${id}`, data).then((res) => res.data),
  delete: (id: number | string) => api.delete(`/activities/${id}`).then((res) => res.data),
};
```

#### **organizationsApi** ✅ (BARU)
```typescript
export const organizationsApi = {
  getAll: () => api.get('/organizations').then(res => res.data),
  create: (data: any) => api.post('/organizations', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/organizations/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/organizations/${id}`).then(res => res.data),
};
```

#### **productsApi** ✅ (BARU)
```typescript
export const productsApi = {
  getAll: () => api.get('/products').then(res => res.data),
  create: (data: any) => api.post('/products', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/products/${id}`).then(res => res.data),
};
```

#### **postsApi** ✅ (BARU)
```typescript
export const postsApi = {
  getAll: () => api.get('/posts').then(res => res.data),
  create: (data: any) => api.post('/posts', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/posts/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/posts/${id}`).then(res => res.data),
};
```

#### **agendasApi** ✅ (BARU)
```typescript
export const agendasApi = {
  getAll: (params: { month: number; year: number }) => getAgendas(params),
  create: (data: any) => api.post('/agendas', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/agendas/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/agendas/${id}`).then(res => res.data),
};
```

Dan juga: **housesApi**, **residentsApi**, **paymentsApi**, **kegiatanApi**, **komunitasApi**

---

## Cara Debugging Masalah Insert

### 1. **Buka Browser Console (F12)**
Setiap kali Anda melakukan insert, Anda akan melihat log seperti ini:

```
[API Request] POST /api/activities { type: "postingan", time: "10:30", message: "Test" }
[API Response] POST /api/activities { id: 123, type: "postingan", ... }
```

### 2. **Jika Ada Error**

**Error di backend (4xx/5xx):**
```
[API Error Response] {
  status: 400,
  data: { message: "Field 'message' is required" },
  url: "/api/activities"
}
```
→ Akan muncul alert: `Error 400: Field 'message' is required`

**Tidak bisa konek ke server:**
```
[API No Response] XMLHttpRequest { ... }
```
→ Akan muncul alert: `Tidak dapat terhubung ke server...`

**CORS Error:**
Biasanya muncul di console:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/activities' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

---

## Checklist Troubleshooting

Jika insert masih tidak bekerja, periksa:

- [ ] **Backend berjalan?** - Pastikan API server aktif
- [ ] **CORS dikonfigurasi?** - Backend harus allow origin dari frontend
- [ ] **Endpoint ada?** - Backend punya route POST `/api/activities`, dll
- [ ] **Data valid?** - Backend tidak reject karena validasi
- [ ] **Database konek?** - Backend bisa akses database
- [ ] **Console log?** - Periksa console browser untuk error detail

---

## Contoh Penggunaan

### Insert Data Aktivitas:
```typescript
import { activitiesApi } from './api';

const handleSubmit = async () => {
  try {
    const result = await activitiesApi.create({
      type: 'postingan',
      time: '10:30',
      message: 'Test aktivitas',
      user: 'Admin'
    });
    console.log('Sukses:', result);
  } catch (error) {
    console.error('Gagal insert:', error);
  }
};
```

### Insert Data Post:
```typescript
import { postsApi } from './api';

const createPost = async () => {
  try {
    const result = await postsApi.create({
      title: 'Judul Post',
      content: 'Isi konten...',
      author: 'John Doe'
    });
    console.log('Post berhasil dibuat:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Backend Requirements

Pastikan backend Anda mendukung endpoint berikut:

```
POST   /api/activities
PUT    /api/activities/:id
DELETE /api/activities/:id

POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id

POST   /api/organizations
PUT    /api/organizations/:id
DELETE /api/organizations/:id

POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

POST   /api/agendas
PUT    /api/agendas/:id
DELETE /api/agendas/:id

... dan seterusnya
```

Dan CORS configuration:
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173', // atau domain frontend Anda
  credentials: true
}));
```

---

## Kesimpulan

Dengan perubahan ini, sekarang Anda akan:
1. ✅ Melihat semua request/response di console
2. ✅ Mendapat alert jika ada error
3. ✅ Punya CRUD lengkap untuk semua resource
4. ✅ Mudah debugging masalah API

Jika masih ada masalah, periksa console browser untuk detail error!
