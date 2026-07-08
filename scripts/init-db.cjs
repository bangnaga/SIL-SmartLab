const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../sil.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🔧 Initializing database...');

  // ===== DROP & RECREATE =====
  const tables = [
    'users', 'laboratories', 'inventory_categories', 'courses', 'classes', 'class_students',
    'inventory', 'loans', 'lab_worksheets', 'audit_trail',
    'learning_materials', 'quiz_results', 'calendar_events', 'support_tickets',
    'ml_predictions', 'settings'
  ];
  tables.forEach(t => db.run(`DROP TABLE IF EXISTS ${t}`));

  // ... (previous table definitions)

  // 14. ML Predictions
  db.run(`CREATE TABLE ml_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        result_label TEXT NOT NULL,
        confidence REAL,
        image_url TEXT,
        status TEXT DEFAULT 'logged',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

  // 15. System Settings
  db.run(`CREATE TABLE settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // ==========================================
  // MASTER TABLES
  // ==========================================

  // 1. Users
  db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        nim TEXT,
        nip TEXT,
        role TEXT DEFAULT 'student',
        phone TEXT,
        avatar_url TEXT,
        password TEXT DEFAULT 'password123',
        llm_usage INTEGER DEFAULT 0,
        llm_quota INTEGER DEFAULT 50,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // 2. Laboratories (Master Lab)
  db.run(`CREATE TABLE laboratories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        building TEXT,
        floor TEXT,
        room_number TEXT,
        capacity INTEGER DEFAULT 20,
        lab_type TEXT NOT NULL,
        head_lecturer_id INTEGER,
        equipment_notes TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(head_lecturer_id) REFERENCES users(id)
    )`);

  // 2b. Inventory Categories (Master Kategori Inventaris)
  db.run(`CREATE TABLE inventory_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // 3. Courses (Master Mata Kuliah)
  db.run(`CREATE TABLE courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        credits INTEGER DEFAULT 2,
        semester INTEGER,
        category TEXT,
        description TEXT,
        lecturer_id INTEGER,
        lab_id INTEGER,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lecturer_id) REFERENCES users(id),
        FOREIGN KEY(lab_id) REFERENCES laboratories(id)
    )`);

  // 4. Classes (Master Kelas)
  db.run(`CREATE TABLE classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        semester TEXT NOT NULL,
        course_id INTEGER,
        lecturer_id INTEGER,
        lab_id INTEGER,
        schedule_day TEXT,
        schedule_start TEXT,
        schedule_end TEXT,
        max_students INTEGER DEFAULT 25,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(course_id) REFERENCES courses(id),
        FOREIGN KEY(lecturer_id) REFERENCES users(id),
        FOREIGN KEY(lab_id) REFERENCES laboratories(id)
    )`);

  // 5. Class-Student Enrollment (Pivot)
  db.run(`CREATE TABLE class_students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(class_id) REFERENCES classes(id),
        FOREIGN KEY(student_id) REFERENCES users(id),
        UNIQUE(class_id, student_id)
    )`);

  // ==========================================
  // OPERATIONAL TABLES
  // ==========================================

  // 5.5 Master Locations
  db.run(`CREATE TABLE master_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lab_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lab_id) REFERENCES laboratories(id)
    )`);

  // 6. Inventory
  db.run(`CREATE TABLE inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'alat',
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL,
        unit TEXT NOT NULL,
        lab_id INTEGER,
        location TEXT,
        min_stock INTEGER DEFAULT 5,
        expired_date DATETIME,
        description TEXT,
        barcode TEXT,
        image_url TEXT,
        formula TEXT,
        msds_level TEXT,
        physical_state TEXT,
        batch_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lab_id) REFERENCES laboratories(id)
    )`);

  // 7. Loans
  db.run(`CREATE TABLE loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        item_id INTEGER,
        quantity INTEGER DEFAULT 1,
        purpose TEXT,
        loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        return_date DATETIME,
        status TEXT DEFAULT 'borrowed',
        initial_condition TEXT DEFAULT 'Bagus',
        final_condition TEXT,
        fine_amount REAL DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(item_id) REFERENCES inventory(id)
    )`);

  // 7.5 Inventory Transactions
  db.run(`CREATE TABLE inventory_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        user_id INTEGER,
        transaction_type TEXT NOT NULL,
        quantity_changed INTEGER NOT NULL,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY(item_id) REFERENCES inventory(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

  // 8. Lab Worksheets (LKP)
  db.run(`CREATE TABLE lab_worksheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        lecturer_id INTEGER,
        class_id INTEGER,
        sample_id TEXT NOT NULL,
        prediction TEXT,
        confidence REAL,
        actual_result TEXT,
        grade REAL,
        feedback TEXT,
        status TEXT DEFAULT 'submitted',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id),
        FOREIGN KEY(lecturer_id) REFERENCES users(id),
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`);

  // 9. Audit Trail
  db.run(`CREATE TABLE audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

  // 10. Learning Materials
  db.run(`CREATE TABLE learning_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        course_id INTEGER,
        lecturer_id INTEGER,
        url TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(course_id) REFERENCES courses(id),
        FOREIGN KEY(lecturer_id) REFERENCES users(id)
    )`);

  // 11. Quiz Results
  db.run(`CREATE TABLE quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        quiz_id INTEGER,
        class_id INTEGER,
        score REAL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id),
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`);

  // 12. Calendar Events
  db.run(`CREATE TABLE calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        lab_id INTEGER,
        class_id INTEGER,
        lecturer_id INTEGER,
        event_type TEXT DEFAULT 'practicum',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(lab_id) REFERENCES laboratories(id),
        FOREIGN KEY(class_id) REFERENCES classes(id),
        FOREIGN KEY(lecturer_id) REFERENCES users(id)
    )`);

  // 13. Support Tickets
  db.run(`CREATE TABLE support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        lab_id INTEGER,
        subject TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'general',
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(lab_id) REFERENCES laboratories(id)
    )`);

  // ==========================================
  // SEED DATA
  // ==========================================
  console.log('🌱 Seeding data...');

  // ---- USERS (1 admin, 2 dosen, 3 mahasiswa, 1 laboran) ----
  db.run(`INSERT INTO users (email, name, nim, nip, role, phone) VALUES
        ('admin@sil.ac.id',       'Super Admin',        NULL,            '19800101001', 'admin',    '08110001111'),
        ('dosen@sil.ac.id',       'Dr. Andi Pratama',   NULL,            '19850315002', 'lecturer', '08120002222'),
        ('mahasiswa@sil.ac.id',   'Aris Setiawan',      'D411211001',    NULL,          'student',  '08130003333'),
        ('dosen2@sil.ac.id',      'Dr. Siti Rahma',     NULL,            '19880620003', 'lecturer', '08140004444'),
        ('mhs2@sil.ac.id',        'Budi Santoso',       'D411211002',    NULL,          'student',  '08150005555'),
        ('mhs3@sil.ac.id',        'Citra Dewi',         'D411211003',    NULL,          'student',  '08160006666'),
        ('laboran@sil.ac.id',     'Pak Rahman',         NULL,            '19900101004', 'admin',    '08170007777')
    `);

  // ---- LABORATORIES (6 lab) ----
  db.run(`INSERT INTO laboratories (code, name, building, floor, room_number, capacity, lab_type, head_lecturer_id, equipment_notes) VALUES
        ('LAB-HEM',  'Laboratorium Hematologi',        'Gedung A', 'Lt. 2', 'A-204', 25, 'hematologi',    2, 'Hemocytometer, Centrifuge, Mikroskop 10 unit'),
        ('LAB-MIK',  'Laboratorium Mikrobiologi',      'Gedung A', 'Lt. 3', 'A-312', 20, 'mikrobiologi',  2, 'Inkubator, Autoclave, BSC Class II'),
        ('LAB-KIM',  'Laboratorium Kimia Klinik',      'Gedung B', 'Lt. 1', 'B-104', 20, 'kimia_klinik',  4, 'Spektrofotometer, Analyzer Semi-Auto'),
        ('LAB-PAR',  'Laboratorium Parasitologi',      'Gedung A', 'Lt. 2', 'A-208', 20, 'parasitologi',  4, 'Mikroskop 8 unit, Centrifuge'),
        ('LAB-IMU',  'Laboratorium Imunologi',         'Gedung B', 'Lt. 2', 'B-210', 15, 'imunologi',     2, 'ELISA Reader, Washer, Micropipette set'),
        ('LAB-BIO',  'Laboratorium Biokimia',          'Gedung B', 'Lt. 1', 'B-102', 20, 'biokimia',      4, 'Electrophoresis, pH Meter, Waterbath')
    `);

  // ---- INVENTORY CATEGORIES ----
  db.run(`INSERT INTO inventory_categories (name, description) VALUES
        ('Reagen', 'Bahan kimia atau biologi yang digunakan untuk reaksi tes'),
        ('Consumable', 'Barang habis pakai (spuit, tabung, swab)'),
        ('Alat', 'Peralatan utama laboratorium (mikroskop, centrifuge, dll)')
    `);

  // ---- COURSES (Mata Kuliah - 8 MK) ----
  db.run(`INSERT INTO courses (code, name, credits, semester, category, description, lecturer_id, lab_id) VALUES
        ('MK-HEM1', 'Hematologi I',            3, 3, 'Wajib',  'Dasar-dasar pemeriksaan hematologi: CBC, LED, hitung jenis', 2, 1),
        ('MK-HEM2', 'Hematologi II',           3, 5, 'Wajib',  'Pem. hemostasis, koagulasi, dan kelainan darah',             2, 1),
        ('MK-MIK1', 'Mikrobiologi Medis',      3, 4, 'Wajib',  'Identifikasi bakteri, kultur, dan uji sensitivitas',         2, 2),
        ('MK-KIM1', 'Kimia Klinik I',          3, 3, 'Wajib',  'Pemeriksaan glukosa, lipid profil, fungsi hati',             4, 3),
        ('MK-KIM2', 'Kimia Klinik II',         3, 5, 'Wajib',  'Pemeriksaan elektrolit, BGA, fungsi ginjal',                 4, 3),
        ('MK-PAR1', 'Parasitologi Medis',      2, 4, 'Wajib',  'Identifikasi parasit darah dan tinja',                       4, 4),
        ('MK-IMU1', 'Imunoserologi',           3, 5, 'Wajib',  'Uji widal, ASTO, RF, CRP, golongan darah',                  2, 5),
        ('MK-BIO1', 'Biokimia Klinik',         2, 3, 'Pilihan','Prinsip dasar biokimia untuk analisis laboratorium',          4, 6)
    `);

  // ---- CLASSES (Kelas - 10 kelas) ----
  db.run(`INSERT INTO classes (code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students) VALUES
        ('KLS-HEM1A', 'Hematologi I - Kelas A',      '2025/2026', 'Genap', 1, 2, 1, 'Senin',   '08:00', '10:30', 25),
        ('KLS-HEM1B', 'Hematologi I - Kelas B',      '2025/2026', 'Genap', 1, 2, 1, 'Rabu',    '08:00', '10:30', 25),
        ('KLS-MIK1A', 'Mikrobiologi - Kelas A',      '2025/2026', 'Genap', 3, 2, 2, 'Selasa',  '13:00', '15:30', 20),
        ('KLS-KIM1A', 'Kimia Klinik I - Kelas A',    '2025/2026', 'Genap', 4, 4, 3, 'Kamis',   '08:00', '10:30', 20),
        ('KLS-KIM1B', 'Kimia Klinik I - Kelas B',    '2025/2026', 'Genap', 4, 4, 3, 'Jumat',   '08:00', '10:30', 20),
        ('KLS-PAR1A', 'Parasitologi - Kelas A',      '2025/2026', 'Genap', 6, 4, 4, 'Rabu',    '13:00', '15:00', 20),
        ('KLS-IMU1A', 'Imunoserologi - Kelas A',     '2025/2026', 'Genap', 7, 2, 5, 'Jumat',   '13:00', '15:30', 15),
        ('KLS-HEM2A', 'Hematologi II - Kelas A',     '2025/2026', 'Genap', 2, 2, 1, 'Senin',   '13:00', '15:30', 25),
        ('KLS-KIM2A', 'Kimia Klinik II - Kelas A',   '2025/2026', 'Genap', 5, 4, 3, 'Kamis',   '13:00', '15:30', 20),
        ('KLS-BIO1A', 'Biokimia Klinik - Kelas A',   '2025/2026', 'Genap', 8, 4, 6, 'Selasa',  '08:00', '10:00', 20)
    `);

  // ---- CLASS ENROLLMENTS ----
  db.run(`INSERT INTO class_students (class_id, student_id) VALUES
        (1, 3), (1, 5), (1, 6),
        (2, 3), (2, 5),
        (3, 3), (3, 6),
        (4, 5), (4, 6),
        (5, 3),
        (6, 3), (6, 5), (6, 6),
        (7, 5),
        (10, 3), (10, 6)
    `);

  // ---- MASTER LOCATIONS ----
  db.run(`INSERT INTO master_locations (lab_id, name, description) VALUES
        (1, 'Gudang Utama', 'Penyimpanan utama alat dan bahan'),
        (1, 'Pendingin 02', 'Kulkas reagen khusus 2-8 C'),
        (2, 'Rak Alat', 'Rak penyimpanan mikroskop'),
        (3, 'Lemari Asam', 'Untuk reagen volatil'),
        (5, 'Meja Utama', 'Meja preparasi')
    `);

  // ---- INVENTORY (linked to labs) ----
  db.run(`INSERT INTO inventory (type, name, category, stock, unit, lab_id, location, min_stock, expired_date, barcode, image_url, formula, msds_level, physical_state, batch_number) VALUES
        ('bhp', 'Reagen Hemoglobin A1c',   'Reagen',     42,  'Kit', 1, 'Pendingin 02', 10, '2026-08-15', '1000123456789', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500', NULL, 'Sedang', 'Cair', 'BCH-001'),
        ('bhp', 'Swab Steril',             'Consumable', 150, 'Pcs', 2, 'Gudang Utama', 50,  NULL,         '1000987654321', NULL, NULL, 'Rendah', 'Padat', NULL),
        ('alat', 'Mikroskop Binokuler',     'Alat',       20,  'Unit',2, 'Rak Utama',    5,   NULL,         '2000112233445', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500', NULL, NULL, NULL, NULL),
        ('bhp', 'Reagen Glukosa',          'Reagen',     8,   'Kit', 3, 'Pendingin 01', 10, '2026-06-30', '1000445566778', NULL, 'C6H12O6', 'Rendah', 'Cair', 'BCH-002'),
        ('alat', 'Pipet Mikro P20',         'Alat',       35,  'Unit',1, 'Rak Alat',     10,  NULL,         '2000998877665', 'https://images.unsplash.com/photo-1629904853716-f0bc54eaa98b?w=500', NULL, NULL, NULL, NULL),
        ('bhp', 'Tabung Vacutainer EDTA',  'Consumable', 200, 'Pcs', 1, 'Gudang Utama', 50, '2027-01-01', '1000332211000', NULL, NULL, 'Rendah', 'Padat', NULL),
        ('alat', 'Centrifuge Digital',      'Alat',       5,   'Unit',3, 'Meja Utama',   2,   NULL,         '2000554433221', NULL, NULL, NULL, NULL, NULL),
        ('bhp', 'Strip Urin 10P',         'Reagen',     75,  'Box', 3, 'Pendingin 03', 20, '2026-11-20', '1000667788990', NULL, NULL, 'Rendah', 'Padat', 'BCH-003'),
        ('alat', 'Rak Tabung Reaksi',       'Alat',       30,  'Unit',1, 'Gudang Utama', 10,  NULL,         '2000223344556', NULL, NULL, NULL, NULL, NULL),
        ('bhp', 'Reagen Widal',            'Reagen',     12,  'Kit', 5, 'Pendingin 01', 5,  '2026-09-01', '1000889900112', NULL, NULL, 'Sedang', 'Cair', 'BCH-004'),
        ('alat', 'Inkubator 37°C',          'Alat',       3,   'Unit',2, 'Ruang Inkubasi',1,  NULL,         '2000776655443', NULL, NULL, NULL, NULL, NULL),
        ('alat', 'ELISA Reader',            'Alat',       2,   'Unit',5, 'Meja Utama',   1,   NULL,         '2000443322110', NULL, NULL, NULL, NULL, NULL)
    `);

  // ---- LOANS ----
  db.run(`INSERT INTO loans (user_id, item_id, quantity, purpose, status, initial_condition) VALUES
        (3, 5, 1, 'Praktikum Hematologi I', 'borrowed', 'Bagus'),
        (3, 7, 1, 'Proyek Akhir Kimia Klinik', 'borrowed', 'Bagus'),
        (5, 3, 2, 'Praktikum Mikrobiologi', 'borrowed', 'Bagus'),
        (6, 11, 1, 'Tugas Mandiri', 'returned', 'Bagus')
    `);

  // ---- INVENTORY TRANSACTIONS ----
  db.run(`INSERT INTO inventory_transactions (item_id, user_id, transaction_type, quantity_changed, notes) VALUES
        (1, 2, 'restock', 10, 'Pembelian bulanan'),
        (4, 3, 'usage', -2, 'Praktikum Kimia Klinik 1'),
        (8, 2, 'waste', -1, 'Kedaluwarsa')
    `);

  // ---- LAB WORKSHEETS (linked to class) ----
  db.run(`INSERT INTO lab_worksheets (student_id, lecturer_id, class_id, sample_id, prediction, confidence, actual_result, status) VALUES
        (3, 2, 1, 'SPL-2026-001', 'Normal (98 mg/dL)', 0.94, '98 mg/dL', 'submitted'),
        (3, 2, 1, 'SPL-2026-002', 'Tinggi (142 mg/dL)', 0.87, NULL,       'submitted'),
        (5, 2, 2, 'SPL-2026-003', 'Normal',             0.91, '5.2%',     'graded'),
        (6, 4, 4, 'SPL-2026-004', 'Abnormal',           0.78, NULL,       'submitted'),
        (3, 2, 3, 'SPL-2026-005', 'S. aureus',          0.92, 'S. aureus','graded')
    `);

  // ---- QUIZ RESULTS ----
  db.run(`INSERT INTO quiz_results (student_id, quiz_id, class_id, score) VALUES
        (3, 1, 1, 85),  (3, 2, 3, 92),
        (5, 1, 2, 78),  (5, 2, 7, 88),
        (6, 1, 4, 91),  (6, 2, 6, 75)
    `);

  // ---- LEARNING MATERIALS (linked to course & lecturer) ----
  db.run(`INSERT INTO learning_materials (title, type, category, course_id, lecturer_id, url, description) VALUES
        ('Panduan Hematologi Dasar',         'PDF',   'Hematologi',    1, 2, '/materials/hematologi.pdf',     'Panduan lengkap pemeriksaan darah rutin'),
        ('Video: Teknik Pewarnaan Gram',     'Video', 'Mikrobiologi',  3, 2, '/materials/pewarnaan-gram.mp4', 'Tutorial pewarnaan gram step-by-step'),
        ('Modul Biokimia Klinik',            'PDF',   'Biokimia',      8, 4, '/materials/biokimia.pdf',      'Modul praktikum biokimia klinik semester 4'),
        ('Infografis: Siklus Parasit Malaria','Image','Parasitologi',  6, 4, '/materials/malaria.png',       'Infografis siklus hidup parasit malaria'),
        ('SOP Pengambilan Darah Vena',       'PDF',   'Flebotomi',     1, 2, '/materials/sop-vena.pdf',      'SOP pengambilan sampel darah vena'),
        ('Atlas Sel Darah',                  'PDF',   'Hematologi',    2, 4, '/materials/atlas-darah.pdf',   'Atlas gambar sel darah normal dan abnormal'),
        ('Video: Uji Widal',                'Video', 'Imunoserologi', 7, 2, '/materials/widal.mp4',         'Prosedur dan interpretasi uji Widal')
    `);

  // ---- CALENDAR EVENTS (linked to lab & class) ----
  db.run(`INSERT INTO calendar_events (title, description, event_date, start_time, end_time, location, lab_id, class_id, lecturer_id, event_type) VALUES
        ('Praktikum Hematologi',      'Analisis Film Darah & Pewarnaan',    '2026-02-24', '08:00', '10:30', 'Lab A-204', 1, 1, 2, 'practicum'),
        ('Praktikum Mikrobiologi',    'Teknik Kultur Bakteri Gram+',        '2026-02-25', '13:00', '15:30', 'Lab A-312', 2, 3, 2, 'practicum'),
        ('Ujian Pre-Lab Biokimia',    'Kuis sebelum sesi praktikum',        '2026-02-26', '08:00', '08:30', 'Lab B-102', 6, 10,4, 'quiz'),
        ('Praktikum Parasitologi',    'Identifikasi parasit darah malaria', '2026-02-27', '13:00', '15:00', 'Lab A-208', 4, 6, 4, 'practicum'),
        ('Seminar Penelitian',        'Presentasi hasil penelitian mhs',    '2026-02-28', '10:00', '12:00', 'Aula Lt. 3',NULL,NULL,2, 'seminar'),
        ('Praktikum Kimia Klinik I',  'Pemeriksaan Glukosa Darah',          '2026-02-27', '08:00', '10:30', 'Lab B-104', 3, 4, 4, 'practicum'),
        ('Praktikum Imunoserologi',   'Uji Golongan Darah ABO-Rh',         '2026-02-28', '13:00', '15:30', 'Lab B-210', 5, 7, 2, 'practicum')
    `);

  // ---- AUDIT TRAIL ----
  db.run(`INSERT INTO audit_trail (user_id, action, resource, details) VALUES
        (1, 'LOGIN',  'auth',           'Admin login dari 192.168.1.10'),
        (2, 'UPDATE', 'lab_worksheets', 'Validasi LKP mahasiswa Aris Setiawan'),
        (1, 'CREATE', 'inventory',      'Menambahkan Reagen Widal ke inventaris'),
        (3, 'CREATE', 'loans',          'Meminjam Pipet Mikro P20'),
        (1, 'CREATE', 'laboratories',   'Menambahkan Lab Imunologi'),
        (4, 'CREATE', 'classes',        'Membuat kelas Parasitologi A'),
        (1, 'DELETE', 'users',          'Menghapus akun test_user@sil.ac.id')
    `);

  // ---- SUPPORT TICKETS (linked to lab) ----
  db.run(`INSERT INTO support_tickets (user_id, lab_id, subject, description, category, priority, status) VALUES
        (3, 1, 'Mikroskop Lab Hematologi rusak', 'Lensa objektif 40x tidak fokus, perlu kalibrasi ulang.',     'equipment', 'high',   'open'),
        (5, NULL, 'Tidak bisa akses materi',     'Link PDF modul biokimia menunjukkan error 404.',             'system',    'medium', 'open'),
        (6, 3, 'Request perpanjangan pinjaman',  'Butuh centrifuge tambahan 3 hari untuk proyek.',             'loan',      'low',    'resolved'),
        (3, 2, 'AC Lab Mikrobiologi mati',       'Suhu lab terlalu panas, tidak cocok untuk inkubasi kultur.', 'facility',  'high',   'open')
    `);

  // ---- SETTINGS ----
  db.run(`INSERT INTO settings (key, value) VALUES ('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY')`);

  console.log('✅ Database initialization complete!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   Master: 7 users, 6 laboratories, 8 courses, 10 classes');
  console.log('   Data:   12 inventory, 4 loans, 5 worksheets, 7 materials, 7 events');
  console.log('');
  console.log('👤 Login credentials (password: password123):');
  console.log('   Admin:    admin@sil.ac.id');
  console.log('   Dosen:    dosen@sil.ac.id / dosen2@sil.ac.id');
  console.log('   Student:  mahasiswa@sil.ac.id / mhs2@sil.ac.id / mhs3@sil.ac.id');
});

db.close();
