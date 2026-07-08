/**
 * Seed Script: Praktikum Komputer Dasar
 * Sumber: Playlist "Belajar Komputer dari Nol untuk Pemula" oleh yudifri_id
 * https://www.youtube.com/playlist?list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm
 *
 * Cara pakai: node scripts/seed-komputer-dasar.cjs
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../sil.db');
const db = new sqlite3.Database(dbPath);

const dbRun = (sql, params = []) =>
  new Promise((res, rej) =>
    db.run(sql, params, function (err) {
      if (err) rej(err);
      else res({ lastID: this.lastID, changes: this.changes });
    })
  );

const dbGet = (sql, params = []) =>
  new Promise((res, rej) =>
    db.get(sql, params, (err, row) => (err ? rej(err) : res(row)))
  );

const dbAll = (sql, params = []) =>
  new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
  );

// ========================
// DATA PRAKTIKUM
// ========================

const COURSE_DATA = {
  code: 'MK-KOM1',
  name: 'Komputer Dasar',
  credits: 2,
  semester: 1,
  category: 'Wajib',
  description: 'Pengenalan dan pengoperasian komputer dari dasar untuk pemula: hardware, software, sistem operasi Windows, dan aplikasi perkantoran.',
  // Gunakan dosen yang ada (dosen@sil.ac.id = id 2, dosen2@sil.ac.id = id 4)
  lecturer_id: 2,
  lab_id: null // universal, tidak terikat lab spesifik
};

const CLASS_DATA = {
  code: 'KLS-KOM1A',
  name: 'Komputer Dasar - Kelas A',
  academic_year: '2025/2026',
  semester: 'Ganjil',
  schedule_day: 'Selasa',
  schedule_start: '10:00',
  schedule_end: '12:00',
  max_students: 30
};

// Topik/Pertemuan berdasarkan playlist yudifri_id
// Video IDs dari playlist PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm
const TOPICS_WITH_MATERIALS = [
  {
    title: 'Pertemuan 1: Pengenalan Komputer',
    description: 'Memahami apa itu komputer, jenis-jenisnya, dan fungsi dasarnya dalam kehidupan sehari-hari.',
    materials: [
      {
        title: 'Belajar Komputer dari Nol untuk Pemula | Panduan Lengkap Step by Step',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk',
        description: 'Video panduan lengkap belajar komputer dari nol, cocok untuk pemula absolut yang belum pernah menggunakan komputer sama sekali.',
        is_prerequisite: 1
      },
      {
        title: 'Pengenalan Hardware Komputer: CPU, RAM, Hardisk',
        type: 'text',
        url: '',
        description: 'Ringkasan materi tentang komponen hardware utama komputer: CPU (Processor), RAM (memori), Hardisk (penyimpanan), dan fungsi masing-masing.',
        is_prerequisite: 0
      }
    ]
  },
  {
    title: 'Pertemuan 2: Mengenal Keyboard & Mouse',
    description: 'Belajar cara menggunakan keyboard dan mouse secara efektif, termasuk shortcut keyboard yang penting.',
    materials: [
      {
        title: 'Cara Menggunakan Keyboard Komputer untuk Pemula',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=2',
        description: 'Tutorial cara menggunakan keyboard dengan benar: posisi jari, tombol-tombol penting, dan teknik mengetik 10 jari.',
        is_prerequisite: 1
      },
      {
        title: 'Shortcut Keyboard Windows yang Wajib Diketahui',
        type: 'text',
        url: '',
        description: 'Daftar shortcut keyboard Windows yang paling sering digunakan: Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+Z (Undo), Alt+F4, Win+D, dan lainnya.',
        is_prerequisite: 0
      }
    ]
  },
  {
    title: 'Pertemuan 3: Sistem Operasi Windows',
    description: 'Mengenal antarmuka Windows, Desktop, Taskbar, Start Menu, dan cara mengelola file & folder.',
    materials: [
      {
        title: 'Cara Menggunakan Windows untuk Pemula Lengkap',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=3',
        description: 'Panduan lengkap mengenal dan menggunakan sistem operasi Windows: dari Desktop, Taskbar, File Explorer, hingga pengaturan dasar.',
        is_prerequisite: 1
      },
      {
        title: 'Mengelola File dan Folder di Windows',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=4',
        description: 'Cara membuat, menyalin, memindahkan, dan menghapus file & folder di Windows Explorer. Termasuk tips organisasi file yang rapi.',
        is_prerequisite: 0
      },
      {
        title: 'Kuis: Sistem Operasi Windows Dasar',
        type: 'quiz',
        url: '',
        description: 'Uji pemahaman Anda tentang sistem operasi Windows dan manajemen file.',
        is_prerequisite: 0,
        quiz_questions: [
          {
            question: 'Tombol shortcut apa yang digunakan untuk menyalin (copy) teks atau file di Windows?',
            options: ['Ctrl+X', 'Ctrl+C', 'Ctrl+V', 'Ctrl+Z'],
            answer: 'B'
          },
          {
            question: 'Apa fungsi dari Recycle Bin (Tempat Sampah) di Windows?',
            options: [
              'Menyimpan file yang belum selesai',
              'Menyimpan file yang telah dihapus sementara',
              'Mengompres file agar lebih kecil',
              'Membersihkan virus dari komputer'
            ],
            answer: 'B'
          },
          {
            question: 'Aplikasi bawaan Windows untuk mengelola file dan folder adalah...',
            options: ['Control Panel', 'Task Manager', 'File Explorer', 'Settings'],
            answer: 'C'
          },
          {
            question: 'Shortcut keyboard untuk membuka menu Start di Windows adalah...',
            options: ['Ctrl+Esc atau tombol Win', 'Alt+Tab', 'Ctrl+Alt+Del', 'F5'],
            answer: 'A'
          },
          {
            question: 'Apa yang dimaksud dengan "Desktop" pada komputer?',
            options: [
              'Nama merk komputer portable',
              'Layar utama yang tampil setelah komputer menyala dan login',
              'Aplikasi untuk mengedit foto',
              'Tempat penyimpanan dokumen penting'
            ],
            answer: 'B'
          }
        ]
      }
    ]
  },
  {
    title: 'Pertemuan 4: Microsoft Word - Dasar',
    description: 'Belajar menggunakan Microsoft Word untuk membuat dokumen: mengetik, memformat teks, menyimpan, dan mencetak.',
    materials: [
      {
        title: 'Cara Menggunakan Microsoft Word untuk Pemula',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=5',
        description: 'Tutorial Microsoft Word dari dasar: membuat dokumen baru, mengetik teks, mengatur font, paragraf, dan menyimpan file .docx.',
        is_prerequisite: 1
      },
      {
        title: 'Format Teks & Paragraf di Microsoft Word',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=6',
        description: 'Cara memformat teks (Bold, Italic, Underline), mengatur alignment paragraf (rata kiri, tengah, kanan, justify), spasi baris, dan indentasi.',
        is_prerequisite: 0
      },
      {
        title: 'Ringkasan: Fitur Utama Microsoft Word',
        type: 'text',
        url: '',
        description: `
**Fitur Utama Microsoft Word yang Wajib Dikuasai Pemula:**

1. **Membuat Dokumen Baru**: File → New → Blank Document (Ctrl+N)
2. **Menyimpan Dokumen**: File → Save As → pilih lokasi (Ctrl+S)
3. **Formatting Teks**:
   - Bold (Ctrl+B): **tebal**
   - Italic (Ctrl+I): *miring*
   - Underline (Ctrl+U): garis bawah
4. **Alignment Paragraf**:
   - Rata Kiri (Ctrl+L)
   - Rata Tengah (Ctrl+E)
   - Rata Kanan (Ctrl+R)
   - Justify / Rata Kanan-Kiri (Ctrl+J)
5. **Mencetak Dokumen**: File → Print (Ctrl+P)
6. **Undo/Redo**: Ctrl+Z / Ctrl+Y
        `.trim(),
        is_prerequisite: 0
      }
    ]
  },
  {
    title: 'Pertemuan 5: Microsoft Word - Lanjutan',
    description: 'Menyisipkan gambar, tabel, header & footer, nomor halaman, dan membuat surat resmi sederhana.',
    materials: [
      {
        title: 'Cara Menyisipkan Tabel di Microsoft Word',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=7',
        description: 'Tutorial menyisipkan dan memformat tabel di Microsoft Word: menambah baris/kolom, merge cell, mengatur border, dan mengisi data.',
        is_prerequisite: 1
      },
      {
        title: 'Membuat Header, Footer & Nomor Halaman di Word',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=8',
        description: 'Cara menambahkan header (kepala halaman), footer (kaki halaman), dan nomor halaman otomatis di Microsoft Word.',
        is_prerequisite: 0
      },
      {
        title: 'Flashcard: Shortcut Microsoft Word',
        type: 'flashcard',
        url: '',
        description: 'Kartu pengingat untuk shortcut keyboard Microsoft Word yang paling penting.',
        is_prerequisite: 0,
        flashcards: [
          { front: 'Ctrl+B', back: 'Bold (Cetak Tebal)' },
          { front: 'Ctrl+I', back: 'Italic (Cetak Miring)' },
          { front: 'Ctrl+U', back: 'Underline (Garis Bawah)' },
          { front: 'Ctrl+S', back: 'Save (Simpan)' },
          { front: 'Ctrl+P', back: 'Print (Cetak)' },
          { front: 'Ctrl+Z', back: 'Undo (Batalkan aksi terakhir)' },
          { front: 'Ctrl+A', back: 'Select All (Pilih semua teks)' },
          { front: 'Ctrl+Home', back: 'Pindah ke awal dokumen' },
          { front: 'Ctrl+End', back: 'Pindah ke akhir dokumen' },
          { front: 'F7', back: 'Spell Check (Periksa ejaan)' }
        ]
      }
    ]
  },
  {
    title: 'Pertemuan 6: Microsoft Excel - Dasar',
    description: 'Pengenalan Microsoft Excel: membuat spreadsheet, memasukkan data, menggunakan formula dasar, dan membuat grafik sederhana.',
    materials: [
      {
        title: 'Tutorial Microsoft Excel untuk Pemula: Dari Nol',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=9',
        description: 'Belajar Microsoft Excel dari nol: mengenal Cell, Row, Column, Sheet, dan cara memasukkan data angka dan teks.',
        is_prerequisite: 1
      },
      {
        title: 'Rumus & Formula Dasar Microsoft Excel',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=10',
        description: 'Cara menggunakan rumus dasar Excel: SUM (penjumlahan), AVERAGE (rata-rata), MAX, MIN, dan COUNT untuk pengolahan data sederhana.',
        is_prerequisite: 0
      },
      {
        title: 'Ringkasan Rumus Excel yang Wajib Dikuasai',
        type: 'text',
        url: '',
        description: `
**Rumus-Rumus Penting Microsoft Excel:**

| Rumus | Fungsi | Contoh |
|-------|--------|--------|
| =SUM(A1:A10) | Menjumlahkan range A1 sampai A10 | =SUM(B2:B20) |
| =AVERAGE(A1:A10) | Menghitung rata-rata | =AVERAGE(C2:C10) |
| =MAX(A1:A10) | Mencari nilai tertinggi | =MAX(D2:D15) |
| =MIN(A1:A10) | Mencari nilai terendah | =MIN(D2:D15) |
| =COUNT(A1:A10) | Menghitung jumlah data angka | =COUNT(E2:E20) |
| =IF(A1>60,"Lulus","Gagal") | Logika kondisi | =IF(B5>=75,"A","B") |

**Tips Penting:**
- Semua formula Excel diawali dengan tanda **=**
- Gunakan **:** untuk menentukan range (contoh A1:A10 = dari sel A1 hingga A10)
- Tekan **Enter** untuk mengkonfirmasi formula
        `.trim(),
        is_prerequisite: 0
      }
    ]
  },
  {
    title: 'Pertemuan 7: Internet & Email',
    description: 'Belajar menggunakan browser internet, mencari informasi, dan mengirim email secara profesional.',
    materials: [
      {
        title: 'Cara Menggunakan Internet dan Browser untuk Pemula',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=11',
        description: 'Panduan menggunakan internet: membuka browser, mencari dengan Google, bookmark halaman, mengunduh file, dan tips keamanan online.',
        is_prerequisite: 1
      },
      {
        title: 'Cara Membuat dan Menggunakan Email (Gmail)',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm&index=12',
        description: 'Tutorial lengkap membuat akun Gmail, mengirim email, membalas, meneruskan (forward), menambahkan lampiran, dan mengelola kotak masuk.',
        is_prerequisite: 0
      }
    ]
  },
  {
    title: 'Pertemuan 8: Evaluasi & Ujian Akhir',
    description: 'Review materi seluruh pertemuan dan ujian akhir komprehensif untuk mengukur pemahaman peserta.',
    materials: [
      {
        title: 'Review Materi: Komputer Dasar Lengkap',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=XcYWilx8Wsk&list=PL4qt0Os0CH2xsIsN-rnQQMGpIRFrX-Tkm',
        description: 'Video rangkuman seluruh materi Komputer Dasar dari Pertemuan 1-7. Tonton sebelum ujian akhir.',
        is_prerequisite: 1
      },
      {
        title: 'Ujian Akhir: Komputer Dasar',
        type: 'quiz',
        url: '',
        description: 'Ujian komprehensif mencakup seluruh materi Komputer Dasar: hardware, Windows, Microsoft Word, Excel, dan Internet.',
        is_prerequisite: 0,
        quiz_questions: [
          {
            question: 'Komponen komputer yang berfungsi sebagai "otak" untuk memproses data disebut...',
            options: ['RAM', 'Hardisk', 'CPU / Processor', 'Monitor'],
            answer: 'C'
          },
          {
            question: 'Apa kepanjangan dari RAM?',
            options: [
              'Read Access Memory',
              'Random Access Memory',
              'Rapid Access Module',
              'Read And Manage'
            ],
            answer: 'B'
          },
          {
            question: 'Untuk menyimpan dokumen yang sedang dikerjakan di Word, shortcut yang digunakan adalah...',
            options: ['Ctrl+C', 'Ctrl+V', 'Ctrl+S', 'Ctrl+P'],
            answer: 'C'
          },
          {
            question: 'Di Microsoft Excel, rumus untuk menjumlahkan data dari sel A1 hingga A5 adalah...',
            options: ['=TOTAL(A1:A5)', '=ADD(A1:A5)', '=SUM(A1:A5)', '=PLUS(A1:A5)'],
            answer: 'C'
          },
          {
            question: 'Browser adalah aplikasi untuk...',
            options: [
              'Mengedit foto dan video',
              'Membuka dan menjelajahi internet',
              'Membuat presentasi PowerPoint',
              'Memindai virus komputer'
            ],
            answer: 'B'
          },
          {
            question: 'Tempat sampah digital di Windows yang menampung file yang baru dihapus disebut...',
            options: ['Trash Can', 'Recycle Bin', 'Delete Folder', 'Waste Bin'],
            answer: 'B'
          },
          {
            question: 'Shortcut keyboard untuk membuat teks TEBAL (Bold) di Microsoft Word adalah...',
            options: ['Ctrl+I', 'Ctrl+U', 'Ctrl+B', 'Ctrl+T'],
            answer: 'C'
          },
          {
            question: 'File Explorer di Windows digunakan untuk...',
            options: [
              'Membuka halaman web',
              'Mengelola file dan folder di komputer',
              'Mengatur koneksi internet',
              'Menginstal aplikasi baru'
            ],
            answer: 'B'
          }
        ]
      }
    ]
  }
];

// Daftarkan mahasiswa ke kelas ini
const STUDENT_IDS = [3, 5, 6]; // mahasiswa@, mhs2@, mhs3@

async function seed() {
  try {
    console.log('🌱 Mulai seeding data Praktikum Komputer Dasar...\n');

    // ---- 1. Cek apakah course sudah ada ----
    const existingCourse = await dbGet('SELECT id FROM courses WHERE code = ?', [COURSE_DATA.code]);
    let courseId;
    if (existingCourse) {
      courseId = existingCourse.id;
      console.log(`✅ Course "${COURSE_DATA.code}" sudah ada (ID: ${courseId}), skip insert.`);
    } else {
      const courseResult = await dbRun(
        `INSERT INTO courses (code, name, credits, semester, category, description, lecturer_id, lab_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          COURSE_DATA.code,
          COURSE_DATA.name,
          COURSE_DATA.credits,
          COURSE_DATA.semester,
          COURSE_DATA.category,
          COURSE_DATA.description,
          COURSE_DATA.lecturer_id,
          COURSE_DATA.lab_id
        ]
      );
      courseId = courseResult.lastID;
      console.log(`✅ Course "${COURSE_DATA.name}" berhasil dibuat (ID: ${courseId})`);
    }

    // ---- 2. Cek/buat Class ----
    const existingClass = await dbGet('SELECT id FROM classes WHERE code = ?', [CLASS_DATA.code]);
    let classId;
    if (existingClass) {
      classId = existingClass.id;
      console.log(`✅ Kelas "${CLASS_DATA.code}" sudah ada (ID: ${classId}), skip insert.`);
    } else {
      const classResult = await dbRun(
        `INSERT INTO classes (code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          CLASS_DATA.code,
          CLASS_DATA.name,
          CLASS_DATA.academic_year,
          CLASS_DATA.semester,
          courseId,
          COURSE_DATA.lecturer_id,
          null,
          CLASS_DATA.schedule_day,
          CLASS_DATA.schedule_start,
          CLASS_DATA.schedule_end,
          CLASS_DATA.max_students
        ]
      );
      classId = classResult.lastID;
      console.log(`✅ Kelas "${CLASS_DATA.name}" berhasil dibuat (ID: ${classId})`);
    }

    // ---- 3. Enroll mahasiswa ke kelas ----
    for (const studentId of STUDENT_IDS) {
      try {
        await dbRun(
          'INSERT OR IGNORE INTO class_students (class_id, student_id, status) VALUES (?, ?, ?)',
          [classId, studentId, 'active']
        );
      } catch (e) { /* ignore duplicate */ }
    }
    console.log(`✅ ${STUDENT_IDS.length} mahasiswa di-enroll ke kelas.`);

    // ---- 4. Buat Topics & Materials ----
    let topicCount = 0;
    let materialCount = 0;
    let quizCount = 0;
    let flashcardCount = 0;

    for (let topicIdx = 0; topicIdx < TOPICS_WITH_MATERIALS.length; topicIdx++) {
      const topicData = TOPICS_WITH_MATERIALS[topicIdx];

      // Cek apakah topik sudah ada (berdasarkan title dan class_id)
      const existingTopic = await dbGet(
        'SELECT id FROM class_topics WHERE class_id = ? AND title = ?',
        [classId, topicData.title]
      );

      let topicId;
      if (existingTopic) {
        topicId = existingTopic.id;
        console.log(`  ⏭  Topik "${topicData.title}" sudah ada, skip.`);
      } else {
        const topicResult = await dbRun(
          'INSERT INTO class_topics (class_id, title, description, order_index) VALUES (?, ?, ?, ?)',
          [classId, topicData.title, topicData.description, topicIdx + 1]
        );
        topicId = topicResult.lastID;
        topicCount++;
        console.log(`\n  📂 Topik ${topicIdx + 1}: "${topicData.title}" (ID: ${topicId})`);
      }

      // Insert materials per topik
      for (let matIdx = 0; matIdx < topicData.materials.length; matIdx++) {
        const mat = topicData.materials[matIdx];

        const existingMat = await dbGet(
          'SELECT id FROM learning_materials WHERE class_id = ? AND title = ?',
          [classId, mat.title]
        );
        if (existingMat) {
          console.log(`    ⏭  Materi "${mat.title}" sudah ada, skip.`);
          continue;
        }

        // Serialize quiz/flashcard content to null first, add separately
        const matResult = await dbRun(
          `INSERT INTO learning_materials 
           (title, type, category, course_id, lecturer_id, url, description, class_id, topic_id, order_index, content, is_prerequisite)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            mat.title,
            mat.type,
            'komputer-dasar',
            courseId,
            COURSE_DATA.lecturer_id,
            mat.url || '',
            mat.description || '',
            classId,
            topicId,
            matIdx + 1,
            null,
            mat.is_prerequisite || 0
          ]
        );

        const matId = matResult.lastID;
        materialCount++;
        console.log(`    📄 [${mat.type.toUpperCase()}] "${mat.title}" (ID: ${matId})`);

        // Tambah quiz questions
        if (mat.type === 'quiz' && mat.quiz_questions) {
          for (let qi = 0; qi < mat.quiz_questions.length; qi++) {
            const q = mat.quiz_questions[qi];
            await dbRun(
              'INSERT INTO quiz_questions (material_id, question, options, correct_answer, order_index) VALUES (?, ?, ?, ?, ?)',
              [matId, q.question, JSON.stringify(q.options), q.answer, qi]
            );
            quizCount++;
          }
          console.log(`      └─ ✅ ${mat.quiz_questions.length} soal kuis ditambahkan`);
        }

        // Tambah flashcards
        if (mat.type === 'flashcard' && mat.flashcards) {
          for (let fi = 0; fi < mat.flashcards.length; fi++) {
            const f = mat.flashcards[fi];
            await dbRun(
              'INSERT INTO flashcards (material_id, front, back, order_index) VALUES (?, ?, ?, ?)',
              [matId, f.front, f.back, fi]
            );
            flashcardCount++;
          }
          console.log(`      └─ ✅ ${mat.flashcards.length} flashcard ditambahkan`);
        }
      }
    }

    console.log('\n' + '═'.repeat(55));
    console.log('🎉 SEEDING SELESAI!');
    console.log('═'.repeat(55));
    console.log(`📚 Course       : "${COURSE_DATA.name}" (${COURSE_DATA.code})`);
    console.log(`🏫 Kelas        : "${CLASS_DATA.name}" (ID: ${classId})`);
    console.log(`📂 Topik Baru   : ${topicCount} topik/pertemuan`);
    console.log(`📄 Materi Baru  : ${materialCount} item`);
    console.log(`❓ Soal Kuis    : ${quizCount} pertanyaan`);
    console.log(`🃏 Flashcard    : ${flashcardCount} kartu`);
    console.log(`👨‍🎓 Mahasiswa    : ${STUDENT_IDS.length} terdaftar`);
    console.log('═'.repeat(55));
    console.log('\n👤 Login sebagai dosen (dosen@sil.ac.id) untuk melihat kurikulum.');
    console.log('👤 Login sebagai mahasiswa (mahasiswa@sil.ac.id) untuk mengakses materi.\n');

  } catch (err) {
    console.error('❌ Error saat seeding:', err.message);
    console.error(err);
  } finally {
    db.close();
  }
}

seed();
