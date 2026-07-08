# 🧪 SIL — Sistem Informasi Laboratorium Medis Cerdas

**Politeknik Kesehatan Muhammadiyah Makassar**

Aplikasi manajemen laboratorium medis berbasis web yang dirancang untuk mahasiswa, dosen, dan admin laboratorium. Dibangun dengan **React + Vite** (frontend) dan **Express.js + SQLite** (backend).

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Inisialisasi database (seed data)
node scripts/init-db.cjs

# 3. Jalankan backend API (port 3001)
npm run server

# 4. Jalankan frontend (port 5173) — di terminal terpisah
npm run dev
```

### Akun Demo

| Role          | Email                 | Password      |
| ------------- | --------------------- | ------------- |
| **Admin**     | `admin@sil.ac.id`     | `password123` |
| **Dosen**     | `dosen@sil.ac.id`     | `password123` |
| **Mahasiswa** | `mahasiswa@sil.ac.id` | `password123` |

---

## � Matrix Fitur berdasarkan Role

### Legenda: ✅ Akses Penuh | 👁️ Lihat Saja | ❌ Tidak Bisa Akses

| Fitur                                   | Mahasiswa | Dosen | Admin |
| --------------------------------------- | :-------: | :---: | :---: |
| **Dashboard**                           |           |       |       |
| Dashboard Mahasiswa (statistik pribadi) |     ✅     |   ❌   |   ❌   |
| Dashboard Dosen (monitoring kelas)      |     ❌     |   ✅   |   ❌   |
| Dashboard Admin (statistik global)      |     ❌     |   ❌   |   ✅   |
| **Lembar Kerja Praktikum (LKP)**        |           |       |       |
| Mengisi & submit LKP                    |     ✅     |   ❌   |   ❌   |
| Melihat prediksi AI & confidence        |     ✅     |   ✅   |   ✅   |
| Validasi, memberi nilai & feedback      |     ❌     |   ✅   |   ❌   |
| **Kuis & Evaluasi**                     |           |       |       |
| Mengerjakan kuis                        |     ✅     |   ❌   |   ❌   |
| Melihat hasil kuis pribadi              |     ✅     |   ❌   |   ❌   |
| Diskusi & pembahasan soal               |     ✅     |   ✅   |   ❌   |
| Manajemen kuis (buat/edit soal)         |     ❌     |   ✅   |   ❌   |
| Rekapitulasi nilai seluruh kelas        |     ❌     |   ✅   |   ❌   |
| **Inventaris & Peminjaman**             |           |       |       |
| Lihat daftar inventaris lab             |     ✅     |   ✅   |   ✅   |
| Ajukan peminjaman alat                  |     ✅     |   ✅   |   ✅   |
| Kembalikan alat (update status)         |     ✅     |   ✅   |   ✅   |
| Kelola stok inventaris (CRUD)           |     ❌     |   ❌   |   ✅   |
| **Kecerdasan Buatan (AI)**              |           |       |       |
| Deteksi Bakteri (ML - Real-time)        |     ✅     |   ✅   |   ✅   |
| Generator Soal Kuis (Gemini 1.5 Flash)  |     ❌     |   ✅   |   ❌   |
| **Jadwal & Kalender**                   |           |       |       |
| Lihat jadwal praktikum                  |     ✅     |   ✅   |   ✅   |
| Membuat jadwal baru                     |     ❌     |   ✅   |   ✅   |
| **Materi Pembelajaran**                 |           |       |       |
| Akses repositori materi                 |     ✅     |   ✅   |   ✅   |
| Upload materi baru                      |     ❌     |   ✅   |   ✅   |
| **Master Data**                         |           |       |       |
| Kelola data Laboratorium                |     ❌     |   ❌   |   ✅   |
| Kelola data Mata Kuliah                 |     ❌     |   👁️   |   ✅   |
| Kelola data Kelas                       |     ❌     |   👁️   |   ✅   |
| Enrollment mahasiswa ke kelas           |     ❌     |   ✅   |   ✅   |
| Kelola data User                        |     ❌     |   ❌   |   ✅   |
| **Monitoring & Admin**                  |           |       |       |
| Analytics Dashboard                     |     ❌     |   ❌   |   ✅   |
| Audit Trail (log aktivitas)             |     ❌     |   ❌   |   ✅   |
| AI Feedback Loop                        |     ❌     |   ❌   |   ✅   |
| **Support & Lainnya**                   |           |       |       |
| Buat tiket bantuan                      |     ✅     |   ✅   |   ✅   |
| Lihat & kelola semua tiket              |     ❌     |   ❌   |   ✅   |
| Edit profil pribadi                     |     ✅     |   ✅   |   ✅   |
| Kuesioner UEQ                           |     ✅     |   ✅   |   ✅   |
| Metrik Penelitian                       |     ✅     |   ✅   |   ✅   |

### Navigasi Bottom Menu per Role

| Menu                | Mahasiswa | Dosen | Admin |
| ------------------- | :-------: | :---: | :---: |
| Beranda / Dashboard |     ✅     |   ✅   |   ✅   |
| Jadwal              |     ✅     |   —   |   —   |
| Inventaris          |     ✅     |   —   |   ✅   |
| Validasi LKP        |     —     |   ✅   |   —   |
| Manajemen Kuis      |     —     |   ✅   |   —   |
| Analytics           |     —     |   —   |   ✅   |
| Profil / Pengaturan |     ✅     |   ✅   |   ✅   |

---

## �📋 Fitur Utama

### 🔐 Autentikasi & Otorisasi
- Login berbasis role (Admin, Dosen, Mahasiswa)
- Auth guard pada seluruh halaman — user yang tidak login akan diarahkan ke halaman login
- Session tersimpan di `localStorage` dengan global state management via React Context
- Redirect otomatis ke dashboard sesuai role setelah login berhasil

### 📊 Dashboard (3 Role)
- **Dashboard Mahasiswa** — Ringkasan statistik (LKP pending, rata-rata kuis, peminjaman aktif), jadwal praktikum mendatang, dan tugas tertunda
- **Dashboard Dosen** — Overview performa mahasiswa, LKP yang menunggu validasi, dan jadwal mengajar
- **Dashboard Admin** — Statistik global sistem: total user, lab, mata kuliah, inventaris, peminjaman, dan aktivitas audit terbaru

### 🏥 Master Data
- **Laboratorium** — 6 lab (Hematologi, Mikrobiologi, Kimia Klinik, Parasitologi, Imunologi, Biokimia) dengan info gedung, lantai, kapasitas, dan kepala lab
- **Mata Kuliah** — 8 MK dengan SKS, semester, kategori, dosen pengampu, dan lab terkait
- **Kelas** — 10 kelas dengan tahun ajaran, semester, jadwal (hari & jam), kuota, dan daftar mahasiswa terdaftar
- **Enrollment** — Pengelolaan mahasiswa per kelas (pivot `class_students`)

### 🧪 Lembar Kerja Praktikum Digital (LKP)
- Mahasiswa mengisi data praktikum digital (sampel, hasil pengukuran)
- AI memberikan **prediksi otomatis** dan **confidence score** untuk setiap hasil
- Dosen dapat **memvalidasi, memberi nilai (0-100), dan menulis feedback** langsung dari halaman koreksi
- Status tracking: `submitted` → `graded`
- Terhubung ke kelas (`class_id`) untuk konteks laboratorium

### 📦 Manajemen Inventaris
- Daftar lengkap **reagen, alat, dan consumable** laboratorium
- Terhubung ke master lab (`lab_id`) — filter per laboratorium
- Indikator stok real-time: `TERSEDIA` (hijau) atau `STOK RENDAH` (kuning, berdasarkan `min_stock`)
- Progress bar visual untuk tingkat stok
- Pencarian cepat berdasarkan nama atau kategori

### 🔄 Sistem Peminjaman Alat (Self-Service)
- Mahasiswa dapat **mengajukan peminjaman** alat laboratorium dengan tujuan penggunaan
- Stok inventaris **berkurang otomatis** saat peminjaman dibuat
- Stok **bertambah kembali** saat status berubah ke `returned`
- Tracking peminjaman: tanggal pinjam, batas waktu, status

### 📝 Kuis & Evaluasi
- Daftar kuis tersedia dengan informasi: jumlah soal, durasi, dan status
- Mahasiswa mengerjakan kuis dan **hasil langsung tersimpan** di database
- Terhubung ke kelas untuk laporan per kelompok
- Riwayat hasil kuis per mahasiswa
- **Diskusi & pembahasan** soal setelah kuis selesai
- **Rekapitulasi nilai** untuk dosen

### 📚 Repositori Materi Pembelajaran
- Koleksi materi: **PDF, Video, Infografis**
- Kategori: Hematologi, Mikrobiologi, Biokimia, Parasitologi, Flebotomi, Imunoserologi
- Terhubung ke mata kuliah (`course_id`) untuk relevansi konten
- Deskripsi dan link download untuk setiap materi

### 📅 Kalender & Penjadwalan Praktikum
- Jadwal praktikum dengan detail: **tanggal, waktu, lab, kelas, dosen pengajar**
- Penjadwalan per **Tahun Ajaran** dan **Semester** melalui tabel `classes`
- Penempatan ruangan/lab berdasarkan `lab_id`
- Dosen dapat **membuat jadwal baru** langsung dari aplikasi
- Tipe event: `practicum`, `quiz`, `seminar`
- Tampilan kalender interaktif dengan strip minggu

### 🛡️ Audit Trail (Admin)
- Log aktivitas seluruh pengguna: LOGIN, CREATE, UPDATE, DELETE
- Mencatat: user, aksi, resource, detail, dan timestamp
- Digunakan untuk **compliance** dan **keamanan sistem**

### 📈 Analytics Dashboard (Admin)
- Ringkasan data: total user, lab, mata kuliah, kelas, inventaris, peminjaman aktif, rata-rata kuis
- Peringatan stok rendah otomatis (`stock <= min_stock`)
- Grafik aktivitas terbaru
- Monitoring performa AI dan akurasi prediksi

### 🤖 AI Feedback Loop (Admin)
- Dashboard untuk mengelola pelatihan ulang model AI
- Monitor **akurasi prediksi** dan **confidence score** AI
- Feedback loop untuk meningkatkan kualitas rekomendasi

### 🎫 Pusat Bantuan & Ticketing
- Mahasiswa/dosen dapat **membuat tiket support** terkait lab tertentu
- Kategori: equipment, system, loan, facility
- Prioritas: high, medium, low
- Status tracking: `open` → `resolved`

### 👤 Profil & Pengaturan
- Edit profil pengguna (nama, email, telepon)
- Info NIM (mahasiswa) atau NIP (dosen/admin)

### 📊 Kuesioner UEQ (User Experience)
- Kuesioner standar **User Experience Questionnaire**
- Digunakan untuk mengukur kualitas pengalaman pengguna aplikasi

### 🔬 Metrik Penelitian
- Dashboard analisis data dan metrik penelitian
- Visualisasi data performa laboratorium

### 🤖 Fitur Kecerdasan Buatan (AI)
- **Deteksi Bakteri ML:** Klasifikasi bakteri real-time menggunakan TensorFlow.js & Teachable Machine.
- **AI Quiz Generator:** Menggunakan Gemini 1.5 Flash untuk membuat soal pilihan ganda dari PDF.
- **Audit Deteksi:** Pencatatan otomatis hasil prediksi untuk keperluan validasi laboratorium.

---

## 🗄️ Struktur Database (13 Tabel)

### Master Tables
| Tabel            | Deskripsi                               | Relasi                               |
| ---------------- | --------------------------------------- | ------------------------------------ |
| `users`          | Data pengguna (mahasiswa, dosen, admin) | —                                    |
| `laboratories`   | Data laboratorium (6 lab)               | → `users` (kepala lab)               |
| `courses`        | Mata kuliah (8 MK)                      | → `users`, `laboratories`            |
| `classes`        | Kelas per TA/Semester (10 kelas)        | → `courses`, `users`, `laboratories` |
| `class_students` | Enrollment mahasiswa ke kelas           | → `classes`, `users`                 |

### Operational Tables
| Tabel                | Deskripsi           | Relasi                               |
| -------------------- | ------------------- | ------------------------------------ |
| `inventory`          | Stok alat & reagen  | → `laboratories`                     |
| `loans`              | Peminjaman alat     | → `users`, `inventory`               |
| `lab_worksheets`     | LKP digital         | → `users`, `classes`                 |
| `quiz_results`       | Hasil kuis          | → `users`, `classes`                 |
| `learning_materials` | Materi pembelajaran | → `courses`                          |
| `calendar_events`    | Jadwal & event      | → `laboratories`, `classes`, `users` |
| `audit_trail`        | Log aktivitas       | → `users`                            |
| `support_tickets`    | Tiket bantuan       | → `users`, `laboratories`            |
| `ml_predictions`     | Audit deteksi AI    | → `users`                            |

---

## 🏗️ Arsitektur

```
SIL/
├── server/              # Backend Express.js
│   └── index.js         # 28 API endpoints
├── scripts/
│   └── init-db.cjs      # Database seeder (13 tabel, data lengkap)
├── src/
│   ├── components/
│   │   ├── layout/      # MobileContainer, BottomNav, ProtectedRoute
│   │   └── ui/          # Button, Input, Card, Toast, Skeleton, EmptyState
│   ├── context/
│   │   └── AuthContext.jsx  # Global auth state
│   ├── services/
│   │   └── api.js       # 30 API functions
│   ├── pages/           # 22 halaman (12 direktori fitur)
│   │   ├── auth/        # Login
│   │   ├── dashboard/   # Student, Lecturer, Admin
│   │   ├── inventory/   # Inventaris, Peminjaman
│   │   ├── lab/         # LKP, Validasi LKP
│   │   ├── quiz/        # Kuis, Hasil, Diskusi
│   │   ├── lecturer/    # Manajemen Kuis, Rekap Nilai
│   │   ├── admin/       # Analytics, Audit, AI Feedback
│   │   ├── learning/    # Repositori Materi
│   │   ├── calendar/    # Kalender Praktikum
│   │   ├── research/    # Metrik, UEQ
│   │   ├── support/     # Ticketing
│   │   └── profile/     # Profil & Pengaturan
│   ├── App.jsx          # Router + AuthProvider + ToastProvider
│   └── main.jsx         # Entry point
├── sil.db               # SQLite database
├── tailwind.config.js   # Extended theme, animasi kustom
└── package.json
```

## 🛠️ Tech Stack

| Layer    | Teknologi                         |
| -------- | --------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS 3    |
| Backend  | Express.js 5                      |
| Database | SQLite 3 (13 tabel, FK relations) |
| Font     | Manrope (Google Fonts)            |
| Icons    | Material Icons Round              |
| Routing  | React Router DOM v6               |

## 📡 API Endpoints

### Auth & Users
| Method  | Endpoint          | Deskripsi         |
| ------- | ----------------- | ----------------- |
| `POST`  | `/api/auth/login` | Login user        |
| `GET`   | `/api/users`      | Daftar semua user |
| `GET`   | `/api/users/:id`  | Profil user       |
| `PATCH` | `/api/users/:id`  | Update profil     |

### Master Data
| Method | Endpoint                  | Deskripsi           |
| ------ | ------------------------- | ------------------- |
| `GET`  | `/api/laboratories`       | Daftar laboratorium |
| `GET`  | `/api/laboratories/:id`   | Detail lab + alat   |
| `POST` | `/api/laboratories`       | Buat lab baru       |
| `GET`  | `/api/courses`            | Daftar mata kuliah  |
| `GET`  | `/api/courses/:id`        | Detail MK + kelas   |
| `POST` | `/api/courses`            | Buat MK baru        |
| `GET`  | `/api/classes`            | Daftar kelas        |
| `GET`  | `/api/classes/:id`        | Detail kelas + mhs  |
| `POST` | `/api/classes`            | Buat kelas baru     |
| `POST` | `/api/classes/:id/enroll` | Daftarkan mahasiswa |

### Operasional
| Method  | Endpoint                     | Deskripsi           |
| ------- | ---------------------------- | ------------------- |
| `GET`   | `/api/inventory`             | Daftar inventaris   |
| `GET`   | `/api/loans`                 | Daftar peminjaman   |
| `POST`  | `/api/loans`                 | Buat peminjaman     |
| `PATCH` | `/api/loans/:id`             | Update peminjaman   |
| `GET`   | `/api/worksheets`            | Daftar LKP          |
| `PATCH` | `/api/worksheets/:id`        | Validasi LKP        |
| `GET`   | `/api/quiz/list`             | Daftar kuis         |
| `POST`  | `/api/quiz/submit`           | Submit jawaban      |
| `GET`   | `/api/quiz/results/:id`      | Hasil kuis          |
| `GET`   | `/api/materials`             | Materi pembelajaran |
| `GET`   | `/api/calendar/events`       | Jadwal praktikum    |
| `POST`  | `/api/calendar/events`       | Buat jadwal         |
| `GET`   | `/api/audit-trail`           | Log audit           |
| `GET`   | `/api/analytics/summary`     | Data analytics      |
| `GET`   | `/api/dashboard/student/:id` | Statistik mahasiswa |
| `POST`  | `/api/support/tickets`       | Buat tiket          |
| `GET`   | `/api/ml/predictions`        | Riwayat prediksi AI |
| `POST`  | `/api/ml/predictions`        | Catat prediksi baru |
| `POST`  | `/api/quiz/generate`         | Generator kuis AI   |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademis Politeknik Kesehatan Muhammadiyah Makassar.
