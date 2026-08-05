# PRD — Ridwan Portfolio CMS

## 1. Vision

Membuat website portfolio modern yang dapat dikelola melalui dashboard admin tanpa perlu mengubah kode secara manual.

Target utama adalah menampilkan project, skill, dan informasi pribadi secara profesional serta mudah di-update.

---

## 2. Users

### Visitor
- Melihat halaman utama
- Melihat daftar project
- Melihat detail project
- Membuka link GitHub dan demo

### Admin
- Login
- Logout
- Menambah project
- Mengedit project
- Menghapus project
- Upload thumbnail project

---

## 3. Success Criteria (MVP)

Project dianggap selesai jika:

- Admin bisa login
- Admin bisa tambah/edit/hapus project
- Data tersimpan di PostgreSQL
- Pengunjung bisa melihat project
- Website mobile responsive
- Website online (Vercel + Render)

---

## 4. Tech Stack

### Frontend
- Next.js 15
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

---

## 5. Pages

### Public Pages
- Home
- About
- Skills
- Projects
- Contact

### Admin Pages
- /admin/login
- /admin/dashboard
- /admin/projects/new
- /admin/projects/[id]/edit

---

## 6. Data Model

### Project

| Field | Type |
|------|------|
| id | UUID |
| title | String |
| slug | String |
| description | Text |
| technologies | String |
| imageUrl | String |
| githubUrl | String |
| demoUrl | String |
| featured | Boolean |
| createdAt | DateTime |
| updatedAt | DateTime |

### Admin

| Field | Type |
|------|------|
| id | UUID |
| username | String |
| passwordHash | String |
| createdAt | DateTime |

---

## 7. API Endpoints

### Auth
- POST /api/auth/login
- POST /api/auth/logout

### Projects
- GET /api/projects
- GET /api/projects/:slug
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

### Upload
- POST /api/upload

---

## 8. UI Requirements

### Home
- Hero section
- Short introduction
- Featured projects
- Contact CTA

### Projects
- Grid layout
- Project image
- Tech badges
- GitHub button
- Live demo button

### Dashboard
- Table of projects
- Search by title
- Add project button
- Edit/Delete actions

---

## 9. Security

- Password di-hash menggunakan bcrypt
- Session/JWT untuk autentikasi
- Route admin diproteksi
- Upload hanya menerima image

---

## 10. Development Phases

### Phase 1 — Backend Setup
- [ ] Initialize Express
- [ ] Configure Prisma
- [ ] Connect PostgreSQL
- [ ] Create models
- [ ] Run migration

### Phase 2 — Projects API
- [ ] GET all projects
- [ ] GET by slug
- [ ] CREATE project
- [ ] UPDATE project
- [ ] DELETE project

### Phase 3 — Authentication
- [ ] Login endpoint
- [ ] Password hashing
- [ ] JWT/session
- [ ] Middleware protect admin routes

### Phase 4 — Frontend Integration
- [ ] Fetch projects
- [ ] Project detail page
- [ ] Admin dashboard
- [ ] Forms for create/edit

### Phase 5 — Upload & Deployment
- [ ] Image upload
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Final testing

---

## 11. Non-Goals (Jangan Dibuat Sekarang)

- Multi-admin
- Comments
- Likes
- Blog
- Analytics dashboard
- Real-time features
- Dark/light theme switch

Fokus hanya pada portfolio CMS yang stabil dan selesai.