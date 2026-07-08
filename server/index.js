import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.DOMMatrix = class DOMMatrix {};
const pdf = require('pdf-parse');
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const profilDir = join(__dirname, '../public/Profil');
if (!fs.existsSync(profilDir)) {
    fs.mkdirSync(profilDir, { recursive: true });
}

const profileUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, profilDir);
        },
        filename: (req, file, cb) => {
            const ext = file.originalname.split('.').pop();
            cb(null, `user_${req.params.id}_${Date.now()}.${ext}`);
        }
    })
});

// Dynamic Gemini AI Fetcher helper
async function getGenAI() {
    const setting = await dbGet("SELECT value FROM settings WHERE key = 'GEMINI_API_KEY'");
    const apiKey = setting?.value || process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
    return new GoogleGenerativeAI(apiKey);
}

const app = express();
const PORT = process.env.PORT || 3001;
const dbPath = join(__dirname, '../sil.db');

// Database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run('PRAGMA foreign_keys = ON');
    }
});

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /\.vercel\.app$/,
    ],
    credentials: true
}));
app.use(express.json());
app.use('/Profil', express.static(profilDir));


// Helper: promisified db methods
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes }); });
});

async function attachMaterialContent(materials) {
    if (!materials || materials.length === 0) return [];
    
    const quizIds = [];
    const flashcardIds = [];
    
    materials.forEach(m => {
        if (m.type === 'quiz' || m.type === 'exam') {
            quizIds.push(m.id);
        } else if (m.type === 'flashcard') {
            flashcardIds.push(m.id);
        }
    });

    let questionsMap = {};
    let flashcardsMap = {};

    if (quizIds.length > 0) {
        const placeholders = quizIds.map(() => '?').join(',');
        const questions = await dbAll(`SELECT * FROM quiz_questions WHERE material_id IN (${placeholders}) ORDER BY order_index ASC`, quizIds);
        questions.forEach(q => {
            if (!questionsMap[q.material_id]) {
                questionsMap[q.material_id] = [];
            }
            questionsMap[q.material_id].push({
                question: q.question,
                options: JSON.parse(q.options),
                correctAnswer: q.correct_answer
            });
        });
    }

    if (flashcardIds.length > 0) {
        const placeholders = flashcardIds.map(() => '?').join(',');
        const cards = await dbAll(`SELECT * FROM flashcards WHERE material_id IN (${placeholders}) ORDER BY order_index ASC`, flashcardIds);
        cards.forEach(c => {
            if (!flashcardsMap[c.material_id]) {
                flashcardsMap[c.material_id] = [];
            }
            flashcardsMap[c.material_id].push({
                front: c.front,
                back: c.back
            });
        });
    }

    return materials.map(m => {
        let content = null;
        if (m.type === 'quiz' || m.type === 'exam') {
            content = { questions: questionsMap[m.id] || [] };
        } else if (m.type === 'flashcard') {
            content = { flashcards: flashcardsMap[m.id] || [] };
        } else if (m.content) {
            try {
                content = JSON.parse(m.content);
            } catch (e) {
                content = null;
            }
        }
        return {
            ...m,
            content
        };
    });
}


// ========================
// 1. AUTH
// ========================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbGet('SELECT id, email, name, nim, nip, role, phone, avatar_url FROM users WHERE email = ? AND password = ? AND is_active = 1', [email, password]);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        // Update last_active on login
        await dbRun('UPDATE users SET last_active = datetime("now", "localtime") WHERE id = ?', [user.id]);
        
        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/heartbeat', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });
        
        await dbRun('UPDATE users SET last_active = datetime("now", "localtime") WHERE id = ?', [userId]);
        res.json({ message: 'Heartbeat received' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/active', async (req, res) => {
    try {
        // Users active within the last 5 minutes
        const activeUsers = await dbAll(`
            SELECT id, name, role, avatar_url, last_active 
            FROM users 
            WHERE last_active IS NOT NULL 
            AND datetime(last_active) >= datetime('now', 'localtime', '-5 minutes')
            ORDER BY last_active DESC
        `);
        res.json(activeUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 1.5 SETTINGS
// ========================
app.get('/api/settings', async (req, res) => {
    try {
        const rows = await dbAll('SELECT key, value FROM settings');
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            // Upsert settings
            const exists = await dbGet('SELECT key FROM settings WHERE key = ?', [key]);
            if (exists) {
                await dbRun('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?', [value, key]);
            } else {
                await dbRun('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
            }
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 2. USERS
// ========================
app.get('/api/users/:id/quota', async (req, res) => {
    try {
        const user = await dbGet('SELECT llm_usage, llm_quota FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const rows = await dbAll('SELECT id, email, name, nim, nip, role, phone, is_active, created_at FROM users ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await dbGet('SELECT id, email, name, nim, nip, role, phone, avatar_url, created_at FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { email, password, name, nim, nip, role, phone } = req.body;
        const result = await dbRun(
            'INSERT INTO users (email, password, name, nim, nip, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
            [email, password || 'password123', name, nim || null, nip || null, role || 'student', phone || null]
        );
        res.json({ id: result.lastID, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const { name, email, phone, role, nip, nim, is_active, password } = req.body;
        let query = `
            UPDATE users SET 
                name = COALESCE(?, name), 
                email = COALESCE(?, email), 
                phone = COALESCE(?, phone),
                role = COALESCE(?, role),
                nip = COALESCE(?, nip),
                nim = COALESCE(?, nim),
                is_active = COALESCE(?, is_active)
        `;
        let params = [name, email, phone, role, nip, nim, is_active];

        if (password) {
            query += `, password = ?`;
            params.push(password);
        }

        query += ` WHERE id = ?`;
        params.push(req.params.id);

        await dbRun(query, params);
        const updated = await dbGet('SELECT id, email, name, nim, nip, role, phone, avatar_url, is_active, created_at FROM users WHERE id = ?', [req.params.id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/:id/avatar', profileUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const avatarUrl = `/Profil/${req.file.filename}`;

        // Get the old avatar url to delete the file
        const oldUser = await dbGet('SELECT avatar_url FROM users WHERE id = ?', [req.params.id]);
        if (oldUser && oldUser.avatar_url && oldUser.avatar_url.startsWith('/Profil/')) {
            const oldFilename = oldUser.avatar_url.replace('/Profil/', '');
            const oldFilePath = join(profilDir, oldFilename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        await dbRun('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.params.id]);
        res.json({ message: 'Avatar updated successfully', avatar_url: avatarUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await dbRun('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deactivated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

    // ===== CATEGORIES (Master) =====
    app.get('/api/categories', async (req, res) => {
        try {
            const rows = await dbAll('SELECT * FROM inventory_categories ORDER BY name');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/categories', async (req, res) => {
        try {
            const { name, description } = req.body;
            const result = await dbRun(
                'INSERT INTO inventory_categories (name, description) VALUES (?, ?)',
                [name, description]
            );
            res.status(201).json({ id: result.lastID, message: 'Category created' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/api/categories/:id', async (req, res) => {
        try {
            const { name, description } = req.body;
            await dbRun(
                'UPDATE inventory_categories SET name = ?, description = ? WHERE id = ?',
                [name, description, req.params.id]
            );
            res.json({ message: 'Category updated' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.delete('/api/categories/:id', async (req, res) => {
        try {
            await dbRun('DELETE FROM inventory_categories WHERE id = ?', [req.params.id]);
            res.json({ message: 'Category deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
// ========================
app.get('/api/laboratories', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT l.*, u.name as head_lecturer_name,
                   (SELECT COUNT(*) FROM inventory WHERE lab_id = l.id) as total_items,
                   (SELECT COUNT(*) FROM classes WHERE lab_id = l.id AND is_active = 1) as total_classes
            FROM laboratories l
            LEFT JOIN users u ON l.head_lecturer_id = u.id
            ORDER BY l.code
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/laboratories/:id', async (req, res) => {
    try {
        const lab = await dbGet(`
            SELECT l.*, u.name as head_lecturer_name
            FROM laboratories l LEFT JOIN users u ON l.head_lecturer_id = u.id
            WHERE l.id = ?
        `, [req.params.id]);
        if (!lab) return res.status(404).json({ error: 'Laboratory not found' });

        const inventory = await dbAll('SELECT * FROM inventory WHERE lab_id = ?', [req.params.id]);
        const classes = await dbAll(`
            SELECT c.*, co.name as course_name FROM classes c
            LEFT JOIN courses co ON c.course_id = co.id
            WHERE c.lab_id = ? AND c.is_active = 1
        `, [req.params.id]);

        res.json({ ...lab, inventory, classes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/laboratories', async (req, res) => {
    try {
        const { code, name, building, floor, room_number, capacity, lab_type, head_lecturer_id, equipment_notes, ip_camera_url, head_lecturer_name, ip_camera_port } = req.body;
        const result = await dbRun(
            'INSERT INTO laboratories (code, name, building, floor, room_number, capacity, lab_type, head_lecturer_id, equipment_notes, ip_camera_url, head_lecturer_name, ip_camera_port) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [code, name, building, floor, room_number, capacity || 20, lab_type || 'general', head_lecturer_id || null, equipment_notes, ip_camera_url, head_lecturer_name, ip_camera_port]
        );
        res.json({ id: result.lastID, message: 'Laboratory created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/laboratories/:id', async (req, res) => {
    try {
        const { code, name, building, floor, room_number, capacity, lab_type, head_lecturer_id, is_active, equipment_notes, ip_camera_url, head_lecturer_name, ip_camera_port } = req.body;
        await dbRun(
            'UPDATE laboratories SET code=?, name=?, building=?, floor=?, room_number=?, capacity=?, lab_type=?, head_lecturer_id=?, is_active=?, equipment_notes=?, ip_camera_url=?, head_lecturer_name=?, ip_camera_port=? WHERE id=?',
            [code, name, building, floor, room_number, capacity || 20, lab_type || 'general', head_lecturer_id || null, is_active, equipment_notes, ip_camera_url, head_lecturer_name, ip_camera_port, req.params.id]
        );
        res.json({ message: 'Laboratory updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/laboratories/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM laboratories WHERE id=?', [req.params.id]);
        res.json({ message: 'Laboratory deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 4. COURSES (Master Mata Kuliah)
// ========================
app.get('/api/courses', async (req, res) => {
    try {
        const { lecturer_id } = req.query;
        let query = `
            SELECT c.*, u.name as lecturer_name, l.name as lab_name, l.code as lab_code,
                   (SELECT COUNT(*) FROM learning_materials WHERE course_id = c.id) as total_materials
            FROM courses c
            LEFT JOIN users u ON c.lecturer_id = u.id
            LEFT JOIN laboratories l ON c.lab_id = l.id
            WHERE 1=1
        `;
        let params = [];
        if (lecturer_id) {
            query += ' AND c.lecturer_id = ?';
            params.push(lecturer_id);
        }
        if (req.query.student_id) {
            query += ' AND c.id IN (SELECT cl.course_id FROM classes cl JOIN class_students cs ON cl.id = cs.class_id WHERE cs.student_id = ? AND cs.status = "active")';
            params.push(req.query.student_id);
        }
        query += ' ORDER BY c.semester, c.code';
        const rows = await dbAll(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/courses/:id/students', async (req, res) => {
    try {
        const students = await dbAll(`
            SELECT DISTINCT u.id, u.name, u.nim, u.email, u.phone, cs.id as enrollment_id, cs.status, cs.enrolled_at, cs.rejection_reason, cl.name as class_name
            FROM class_students cs
            JOIN users u ON cs.student_id = u.id
            JOIN classes cl ON cs.class_id = cl.id
            WHERE cl.course_id = ?
            ORDER BY cs.enrolled_at DESC
        `, [req.params.id]);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/courses/:id', async (req, res) => {
    try {
        const course = await dbGet(`
            SELECT c.*, u.name as lecturer_name, l.name as lab_name
            FROM courses c
            LEFT JOIN users u ON c.lecturer_id = u.id
            LEFT JOIN laboratories l ON c.lab_id = l.id
            WHERE c.id = ?
        `, [req.params.id]);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        const classes = await dbAll('SELECT * FROM classes WHERE course_id = ? AND is_active = 1', [req.params.id]);
        const materials = await dbAll('SELECT * FROM learning_materials WHERE course_id = ?', [req.params.id]);

        res.json({ ...course, classes, materials });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/courses', async (req, res) => {
    try {
        const { code, name, credits, semester, category, description, lecturer_id, lab_id } = req.body;
        const result = await dbRun(
            'INSERT INTO courses (code, name, credits, semester, category, description, lecturer_id, lab_id) VALUES (?,?,?,?,?,?,?,?)',
            [code, name, credits || 2, semester, category, description, lecturer_id, lab_id]
        );
        res.json({ id: result.lastID, message: 'Course created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/courses/:id', async (req, res) => {
    try {
        const { code, name, credits, semester, category, description, lecturer_id, lab_id, is_active } = req.body;
        await dbRun(`
            UPDATE courses SET 
                code = COALESCE(?, code),
                name = COALESCE(?, name),
                credits = COALESCE(?, credits),
                semester = COALESCE(?, semester),
                category = COALESCE(?, category),
                description = COALESCE(?, description),
                lecturer_id = COALESCE(?, lecturer_id),
                lab_id = COALESCE(?, lab_id),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
            [code, name, credits, semester, category, description, lecturer_id, lab_id, is_active, req.params.id]
        );
        res.json({ message: 'Course updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/courses/:id', async (req, res) => {
    try {
        await dbRun('BEGIN TRANSACTION');
        
        // Manual cascade delete
        await dbRun('DELETE FROM learning_materials WHERE course_id = ?', [req.params.id]);
        
        // Find classes to delete their enrollments and the classes themselves
        const classes = await dbAll('SELECT id FROM classes WHERE course_id = ?', [req.params.id]);
        for (let cls of classes) {
            await dbRun('DELETE FROM class_students WHERE class_id = ?', [cls.id]);
            await dbRun('DELETE FROM lab_worksheets WHERE class_id = ?', [cls.id]);
            await dbRun('DELETE FROM calendar_events WHERE class_id = ?', [cls.id]);
            await dbRun('DELETE FROM quiz_results WHERE class_id = ?', [cls.id]);
        }
        await dbRun('DELETE FROM classes WHERE course_id = ?', [req.params.id]);
        
        // Finally delete the course
        await dbRun('DELETE FROM courses WHERE id = ?', [req.params.id]);
        
        await dbRun('COMMIT');
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});



// ========================
// 5. CLASSES (Master Kelas)
// ========================
app.get('/api/classes', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT cl.*, co.name as course_name, co.code as course_code,
                   u.name as lecturer_name, l.name as lab_name, l.code as lab_code,
                   (SELECT COUNT(*) FROM class_students WHERE class_id = cl.id AND status = 'active') as enrolled_count
            FROM classes cl
            LEFT JOIN courses co ON cl.course_id = co.id
            LEFT JOIN users u ON cl.lecturer_id = u.id
            LEFT JOIN laboratories l ON cl.lab_id = l.id
            WHERE cl.is_active = 1
            ${req.query.lecturer_id ? `AND cl.lecturer_id = ${parseInt(req.query.lecturer_id)}` : ''}
            ORDER BY cl.schedule_day, cl.schedule_start
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/classes/:id', async (req, res) => {
    try {
        const cls = await dbGet(`
            SELECT cl.*, co.name as course_name, u.name as lecturer_name, l.name as lab_name
            FROM classes cl
            LEFT JOIN courses co ON cl.course_id = co.id
            LEFT JOIN users u ON cl.lecturer_id = u.id
            LEFT JOIN laboratories l ON cl.lab_id = l.id
            WHERE cl.id = ?
        `, [req.params.id]);
        if (!cls) return res.status(404).json({ error: 'Class not found' });

        const students = await dbAll(`
            SELECT cs.*, u.name as student_name, u.nim, u.email
            FROM class_students cs JOIN users u ON cs.student_id = u.id
            WHERE cs.class_id = ? AND cs.status = 'active'
            ORDER BY u.name
        `, [req.params.id]);

        res.json({ ...cls, students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/classes', async (req, res) => {
    try {
        const { code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students } = req.body;
        const result = await dbRun(
            'INSERT INTO classes (code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students]
        );
        res.status(201).json({ id: result.lastID, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/classes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students, is_active } = req.body;
        await dbRun(
            'UPDATE classes SET code=?, name=?, academic_year=?, semester=?, course_id=?, lecturer_id=?, lab_id=?, schedule_day=?, schedule_start=?, schedule_end=?, max_students=?, is_active=? WHERE id=?',
            [code, name, academic_year, semester, course_id, lecturer_id, lab_id, schedule_day, schedule_start, schedule_end, max_students, is_active, id]
        );
        res.json({ message: 'Class updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/classes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if there are enrollments before deleting
        const enrollments = await dbAll('SELECT id FROM class_students WHERE class_id = ?', [id]);
        if (enrollments.length > 0) {
            return res.status(400).json({ error: 'Cannot delete class with existing enrollments' });
        }
        await dbRun('DELETE FROM classes WHERE id = ?', [id]);
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enroll student in class
app.post('/api/classes/:id/enroll', async (req, res) => {
    try {
        const { student_id } = req.body;
        
        // Check if enrollment exists
        const existing = await dbGet('SELECT * FROM class_students WHERE class_id = ? AND student_id = ?', [req.params.id, student_id]);
        
        if (existing) {
            if (existing.status === 'active' || existing.status === 'pending') {
                return res.status(400).json({ error: 'Anda sudah terdaftar atau dalam antrean pendaftaran di kelas ini.' });
            }
            
            // If rejected, update to pending
            await dbRun('UPDATE class_students SET status = "pending", rejection_reason = NULL, enrolled_at = CURRENT_TIMESTAMP WHERE id = ?', [existing.id]);
            return res.json({ message: 'Student re-enrolled successfully, pending verification' });
        }

        await dbRun('INSERT INTO class_students (class_id, student_id, status) VALUES (?, ?, ?)', [req.params.id, student_id, 'pending']);
        res.json({ message: 'Student enrolled successfully, pending verification' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Anda sudah terdaftar atau dalam antrean pendaftaran di kelas ini.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Get all enrollments for a class (including pending)
app.get('/api/classes/:id/enrollments', async (req, res) => {
    try {
        const students = await dbAll(`
            SELECT cs.*, u.name as student_name, u.nim, u.email
            FROM class_students cs JOIN users u ON cs.student_id = u.id
            WHERE cs.class_id = ?
            ORDER BY cs.enrolled_at DESC
        `, [req.params.id]);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify/Update enrollment status
app.patch('/api/enrollments/:id', async (req, res) => {
    try {
        const { status, rejection_reason } = req.body; // 'active' or 'rejected'
        await dbRun('UPDATE class_students SET status = ?, rejection_reason = ? WHERE id = ?', [status, rejection_reason || null, req.params.id]);
        res.json({ message: `Enrollment status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/enrollments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbRun('DELETE FROM class_students WHERE id = ?', [id]);
        res.json({ message: 'Enrollment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 6. INVENTORY
// ========================
app.get('/api/inventory', async (req, res) => {
    try {
        const typeFilter = req.query.type ? `WHERE i.type = '${req.query.type}'` : '';
        const rows = await dbAll(`
            SELECT i.*, l.name as lab_name, l.code as lab_code
            FROM inventory i LEFT JOIN laboratories l ON i.lab_id = l.id
            ${typeFilter}
            ORDER BY i.name
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const { type, name, category, stock, unit, min_stock, location, lab_id, description, barcode, image_url, formula, msds_level, physical_state, batch_number, expired_date } = req.body;
        const result = await dbRun(
            'INSERT INTO inventory (type, name, category, stock, unit, min_stock, location, lab_id, description, barcode, image_url, formula, msds_level, physical_state, batch_number, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [type || 'alat', name, category, stock || 0, unit, min_stock || 10, location, lab_id, description, barcode, image_url, formula, msds_level, physical_state, batch_number, expired_date]
        );
        res.status(201).json({ id: result.lastID, message: 'Item added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { type, name, category, stock, unit, min_stock, location, lab_id, description, barcode, image_url, formula, msds_level, physical_state, batch_number, expired_date } = req.body;
        await dbRun(
            'UPDATE inventory SET type = ?, name = ?, category = ?, stock = ?, unit = ?, min_stock = ?, location = ?, lab_id = ?, description = ?, barcode = ?, image_url = ?, formula = ?, msds_level = ?, physical_state = ?, batch_number = ?, expired_date = ? WHERE id = ?',
            [type || 'alat', name, category, stock, unit, min_stock, location, lab_id, description, barcode, image_url, formula, msds_level, physical_state, batch_number, expired_date, req.params.id]
        );
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM inventory WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 6.5 INVENTORY TRANSACTIONS
// ========================
app.get('/api/transactions', async (req, res) => {
    try {
        const { item_id } = req.query;
        let query = `
            SELECT t.*, i.name as item_name, i.unit as item_unit, u.name as user_name
            FROM inventory_transactions t
            LEFT JOIN inventory i ON t.item_id = i.id
            LEFT JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        
        if (item_id) {
            query += ' AND t.item_id = ?';
            params.push(item_id);
        }
        
        query += ' ORDER BY t.transaction_date DESC';
        
        const rows = await dbAll(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { item_id, user_id, transaction_type, quantity_changed, notes } = req.body;
        
        // Input validation
        if (!item_id || !transaction_type || quantity_changed === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Update inventory stock based on transaction type
        const item = await dbGet('SELECT stock FROM inventory WHERE id = ?', [item_id]);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        let newStock = item.stock;
        let qtyToRecord = parseFloat(quantity_changed);
        let status = 'approved';

        if (transaction_type === 'usage') {
            qtyToRecord = -Math.abs(qtyToRecord);
            status = 'pending';
            // Do NOT deduct stock until approved
            if (item.stock + qtyToRecord < 0) {
                 return res.status(400).json({ error: 'Insufficient stock for this request' });
            }
        } else if (transaction_type === 'waste') {
            // Subtract stock
            qtyToRecord = -Math.abs(qtyToRecord);
            newStock = item.stock + qtyToRecord; // qtyToRecord is negative
            if (newStock < 0) {
                return res.status(400).json({ error: 'Insufficient stock' });
            }
        } else if (transaction_type === 'restock') {
            qtyToRecord = Math.abs(qtyToRecord);
            newStock = item.stock + qtyToRecord;
        } else if (transaction_type === 'opname') {
            // Opname replaces the current stock. quantity_changed holds the exact new stock.
            // But for transaction log, we log the delta.
            qtyToRecord = qtyToRecord - item.stock; 
            newStock = parseFloat(quantity_changed);
        }

        await dbRun('BEGIN TRANSACTION');
        
        // Record transaction (log delta)
        await dbRun(
            'INSERT INTO inventory_transactions (item_id, user_id, transaction_type, quantity_changed, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
            [item_id, user_id || null, transaction_type, qtyToRecord, notes, status]
        );

        // Update stock only if approved immediately
        if (status === 'approved') {
            await dbRun('UPDATE inventory SET stock = ? WHERE id = ?', [newStock, item_id]);
        }
        
        await dbRun('COMMIT');
        res.status(201).json({ message: status === 'pending' ? 'Request submitted' : 'Transaction recorded successfully', newStock });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/transactions/:id/approve', async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM inventory_transactions WHERE id = ?', [req.params.id]);
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });
        if (tx.status !== 'pending') return res.status(400).json({ error: 'Transaction is not pending' });

        const item = await dbGet('SELECT stock FROM inventory WHERE id = ?', [tx.item_id]);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        const newStock = item.stock + tx.quantity_changed;
        if (newStock < 0) return res.status(400).json({ error: 'Insufficient stock to approve this request' });

        await dbRun('BEGIN TRANSACTION');
        await dbRun('UPDATE inventory_transactions SET status = "approved" WHERE id = ?', [req.params.id]);
        await dbRun('UPDATE inventory SET stock = ? WHERE id = ?', [newStock, tx.item_id]);
        await dbRun('COMMIT');

        res.json({ message: 'Transaction approved and stock updated' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/transactions/:id/reject', async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM inventory_transactions WHERE id = ?', [req.params.id]);
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });
        if (tx.status !== 'pending') return res.status(400).json({ error: 'Transaction is not pending' });

        await dbRun('UPDATE inventory_transactions SET status = "rejected" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Transaction rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 7. LOANS
// ========================
app.get('/api/loans', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT l.*, u.name as user_name, i.name as item_name, i.unit as item_unit, i.image_url as item_image_url
            FROM loans l
            JOIN users u ON l.user_id = u.id
            JOIN inventory i ON l.item_id = i.id
            ORDER BY l.loan_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/loans', async (req, res) => {
    try {
        const { user_id, item_id, quantity, purpose, initial_condition } = req.body;
        const result = await dbRun(
            'INSERT INTO loans (user_id, item_id, quantity, purpose, initial_condition) VALUES (?, ?, ?, ?, ?)',
            [user_id, item_id, quantity || 1, purpose, initial_condition || 'Bagus']
        );
        await dbRun('UPDATE inventory SET stock = stock - ? WHERE id = ?', [quantity || 1, item_id]);
        res.json({ id: result.lastID, message: 'Loan created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/loans/:id', async (req, res) => {
    try {
        const { status, final_condition, fine_amount } = req.body;
        const loan = await dbGet('SELECT * FROM loans WHERE id = ?', [req.params.id]);
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        
        await dbRun(
            'UPDATE loans SET status = ?, return_date = CURRENT_TIMESTAMP, final_condition = ?, fine_amount = ? WHERE id = ?',
            [status, final_condition, fine_amount || 0, req.params.id]
        );
        
        if (status === 'returned') {
            await dbRun('UPDATE inventory SET stock = stock + ? WHERE id = ?', [loan.quantity, loan.item_id]);
        }
        res.json({ message: 'Loan updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 8. LAB WORKSHEETS
// ========================
app.get('/api/worksheets', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT lw.*, u.name as student_name, cl.name as class_name, 
                   cl.academic_year, cl.semester as class_semester,
                   co.name as course_name, co.id as course_id
            FROM lab_worksheets lw
            JOIN users u ON lw.student_id = u.id
            LEFT JOIN classes cl ON lw.class_id = cl.id
            LEFT JOIN courses co ON cl.course_id = co.id
            ORDER BY lw.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/worksheets/:id', async (req, res) => {
    try {
        const row = await dbGet(`
            SELECT lw.*, u.name as student_name, cl.name as class_name, co.name as course_name
            FROM lab_worksheets lw
            JOIN users u ON lw.student_id = u.id
            LEFT JOIN classes cl ON lw.class_id = cl.id
            LEFT JOIN courses co ON cl.course_id = co.id
            WHERE lw.id = ?
        `, [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Worksheet not found' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/worksheets', async (req, res) => {
    try {
        const { student_id, class_id, sample_id, prediction, confidence, actual_result } = req.body;
        const result = await dbRun(
            'INSERT INTO lab_worksheets (student_id, class_id, sample_id, prediction, confidence, actual_result, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [student_id, class_id, sample_id, prediction, confidence, actual_result, 'submitted']
        );
        res.json({ id: result.lastID, message: 'Worksheet submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/worksheets/:id', async (req, res) => {
    try {
        const { grade, feedback, status } = req.body;
        await dbRun('UPDATE lab_worksheets SET grade = ?, feedback = ?, status = ? WHERE id = ?', [grade, feedback, status, req.params.id]);
        res.json({ message: 'Worksheet updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 9. QUIZ
// ========================
app.get('/api/quiz/list', async (req, res) => {
    try {
        const quizzes = [
            { id: 1, title: 'Pre-Lab: Hemoglobin', subject: 'Hematologi', totalQuestions: 10, duration: 15, status: 'active' },
            { id: 2, title: 'Biokimia Klinik', subject: 'Biokimia', totalQuestions: 15, duration: 20, status: 'active' },
            { id: 3, title: 'Mikrobiologi Dasar', subject: 'Mikrobiologi', totalQuestions: 12, duration: 18, status: 'upcoming' },
            { id: 4, title: 'Parasitologi Medis', subject: 'Parasitologi', totalQuestions: 8, duration: 12, status: 'completed' },
        ];
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/quiz/submit', async (req, res) => {
    try {
        const { student_id, quiz_id, class_id, score, details } = req.body;
        const result = await dbRun(
            'INSERT INTO quiz_results (student_id, quiz_id, class_id, score, details) VALUES (?, ?, ?, ?, ?)',
            [student_id, quiz_id, class_id, score, JSON.stringify(details)]
        );
        res.json({ id: result.lastID, message: 'Quiz submitted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/quiz/results/:studentId', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT qr.*, cl.name as class_name
            FROM quiz_results qr LEFT JOIN classes cl ON qr.class_id = cl.id
            WHERE qr.student_id = ? ORDER BY qr.created_at DESC
        `, [req.params.studentId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 10. CURRICULUM & LEARNING MATERIALS
// ========================
app.get('/api/classes/:id/submissions', async (req, res) => {
    try {
        const classId = req.params.id;
        const submissions = await dbAll(`
            SELECT ms.*, u.name as student_name, u.nim, lm.title as material_title, lm.type as material_type
            FROM material_submissions ms
            JOIN users u ON ms.student_id = u.id
            JOIN learning_materials lm ON ms.material_id = lm.id
            WHERE ms.class_id = ?
            ORDER BY ms.created_at DESC
        `, [classId]);

        const quizzes = await dbAll(`
            SELECT qr.*, u.name as student_name, u.nim, lm.title as material_title, 'quiz' as material_type
            FROM quiz_results qr
            JOIN users u ON qr.student_id = u.id
            JOIN learning_materials lm ON qr.quiz_id = lm.id
            WHERE qr.class_id = ?
            ORDER BY qr.created_at DESC
        `, [classId]);

        res.json({ submissions, quizzes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/submissions/:id/grade', async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        await dbRun(
            'UPDATE material_submissions SET grade = ?, feedback = ?, status = "graded" WHERE id = ?',
            [grade, feedback, req.params.id]
        );
        res.json({ message: 'Submission graded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/materials/:id/submit', async (req, res) => {
    try {
        const materialId = req.params.id;
        const { student_id, class_id, submission_text, file_url } = req.body;
        
        // Check if already submitted
        const existing = await dbGet('SELECT id FROM material_submissions WHERE student_id = ? AND material_id = ?', [student_id, materialId]);
        if (existing) {
            await dbRun(
                'UPDATE material_submissions SET submission_text = ?, file_url = ?, status = "submitted", created_at = CURRENT_TIMESTAMP WHERE id = ?',
                [submission_text, file_url, existing.id]
            );
            return res.json({ id: existing.id, message: 'Submission updated successfully' });
        }

        const result = await dbRun(
            'INSERT INTO material_submissions (student_id, material_id, class_id, submission_text, file_url, status) VALUES (?, ?, ?, ?, ?, ?)',
            [student_id, materialId, class_id, submission_text, file_url, 'submitted']
        );
        res.json({ id: result.lastID, message: 'Submission created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/materials/:id/submissions/:studentId', async (req, res) => {
    try {
        const submission = await dbGet(
            'SELECT * FROM material_submissions WHERE material_id = ? AND student_id = ?',
            [req.params.id, req.params.studentId]
        );
        res.json(submission || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/courses/:id/curriculum', async (req, res) => {
    try {
        const courseId = req.params.id;
        const topics = await dbAll('SELECT * FROM class_topics WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
        const rawMaterials = await dbAll(`
            SELECT lm.*, u.name as lecturer_name 
            FROM learning_materials lm 
            LEFT JOIN users u ON lm.lecturer_id = u.id 
            WHERE lm.course_id = ? 
            ORDER BY lm.order_index ASC
        `, [courseId]);

        const materials = await attachMaterialContent(rawMaterials);

        // Map materials to topics
        const topicsWithMaterials = topics.map(topic => {
            return {
                ...topic,
                materials: materials.filter(m => m.topic_id === topic.id)
            };
        });

        const uncategorized = materials.filter(m => !m.topic_id);

        res.json({ topics: topicsWithMaterials, uncategorized });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/student/courses/:courseId/curriculum', async (req, res) => {
    try {
        const { studentId } = req.query;
        const courseId = req.params.courseId;

        // Find the active class for this student in this course
        const enrolledClass = await dbGet(`
            SELECT cl.id, cl.name 
            FROM classes cl
            JOIN class_students cs ON cl.id = cs.class_id
            WHERE cl.course_id = ? AND cs.student_id = ? AND cs.status = 'active'
        `, [courseId, studentId]);

        if (!enrolledClass) {
            return res.status(404).json({ error: 'Anda tidak terdaftar secara aktif di kelas praktikum ini.' });
        }

        const classId = enrolledClass.id;
        const topics = await dbAll('SELECT * FROM class_topics WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
        const rawMaterials = await dbAll(`
            SELECT lm.*, u.name as lecturer_name 
            FROM learning_materials lm 
            LEFT JOIN users u ON lm.lecturer_id = u.id 
            WHERE lm.course_id = ? 
            ORDER BY lm.order_index ASC
        `, [courseId]);

        const materials = await attachMaterialContent(rawMaterials);

        // Map materials to topics
        const topicsWithMaterials = topics.map(topic => {
            return {
                ...topic,
                materials: materials.filter(m => m.topic_id === topic.id)
            };
        });

        const uncategorized = materials.filter(m => !m.topic_id);

        // Find completed material IDs
        const dbSubmissions = await dbAll('SELECT material_id FROM material_submissions WHERE student_id = ? AND class_id = ?', [studentId, classId]);
        const dbQuizzes = await dbAll('SELECT quiz_id FROM quiz_results WHERE student_id = ? AND class_id = ?', [studentId, classId]);
        const completedIds = [
            ...dbSubmissions.map(s => s.material_id),
            ...dbQuizzes.map(q => q.quiz_id)
        ];

        res.json({ 
            class_id: classId, 
            class_name: enrolledClass.name, 
            topics: topicsWithMaterials, 
            uncategorized,
            completedIds 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/courses/:id/topics', async (req, res) => {
    try {
        const courseId = req.params.id;
        const { title, description } = req.body;

        const maxRow = await dbGet('SELECT MAX(order_index) as max_val FROM class_topics WHERE course_id = ?', [courseId]);
        const newOrder = (maxRow.max_val || 0) + 1;

        const result = await dbRun(
            'INSERT INTO class_topics (course_id, class_id, title, description, order_index) VALUES (?, 0, ?, ?, ?)',
            [courseId, title, description, newOrder]
        );
        res.status(201).json({ id: result.lastID, course_id: courseId, title, description, order_index: newOrder, materials: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/topics/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        await dbRun('UPDATE class_topics SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id]);
        res.json({ message: 'Topic updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/topics/:id', async (req, res) => {
    try {
        await dbRun('BEGIN TRANSACTION');
        // Delete all materials in the topic
        await dbRun('DELETE FROM learning_materials WHERE topic_id = ?', [req.params.id]);
        // Delete the topic itself
        await dbRun('DELETE FROM class_topics WHERE id = ?', [req.params.id]);
        await dbRun('COMMIT');
        res.json({ message: 'Topic and its materials deleted successfully' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/courses/:id/curriculum/reorder', async (req, res) => {
    try {
        const { topics, materials } = req.body;
        await dbRun('BEGIN TRANSACTION');

        if (topics && Array.isArray(topics)) {
            for (const t of topics) {
                await dbRun('UPDATE class_topics SET order_index = ? WHERE id = ?', [t.order_index, t.id]);
            }
        }

        if (materials && Array.isArray(materials)) {
            for (const m of materials) {
                await dbRun('UPDATE learning_materials SET topic_id = ?, order_index = ? WHERE id = ?', [m.topic_id, m.order_index, m.id]);
            }
        }

        await dbRun('COMMIT');
        res.json({ message: 'Curriculum reordered successfully' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai/generate-flashcards', async (req, res) => {
    try {
        const { user_id, concept, type, count, customPrompt } = req.body;
        if (!concept) return res.status(400).json({ error: 'Concept is required' });

        if (user_id) {
            const user = await dbGet('SELECT llm_usage, llm_quota FROM users WHERE id = ?', [user_id]);
            if (user && user.llm_usage >= user.llm_quota) {
                return res.status(403).json({ error: 'Quota LLM Anda telah habis. Silakan hubungi admin.' });
            }
        }

        const genAI = await getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Buatkan ${count || 5} kartu flashcard pembelajaran (Pertanyaan & Jawaban) mengenai topik/konsep berikut: "${concept}".
            Tipe flashcard: ${type || 'Materi Umum (Tanya-Jawab)'}.
            ${customPrompt ? `Petunjuk tambahan: "${customPrompt}"` : ''}

            Format output harus berupa JSON ARRAY murni seperti contoh ini:
            [
              {
                "front": "Apa kepanjangan dari HTML?",
                "back": "HyperText Markup Language"
              }
            ]
            Pastikan output hanya berupa JSON array tersebut, tidak ada markdown block (\`\`\`json), tidak ada teks pembuka/penutup.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();

        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const flashcards = JSON.parse(jsonText);

        if (user_id) {
            await dbRun('UPDATE users SET llm_usage = llm_usage + 1 WHERE id = ?', [user_id]);
        }

        res.json({ flashcards });
    } catch (err) {
        console.error('AI Flashcard Gen Error:', err);
        res.status(500).json({ error: 'Gagal membuat flashcard dengan AI. ' + err.message });
    }
});

app.get('/api/materials', async (req, res) => {
    try {
        const { lecturer_id, course_id, class_id } = req.query;
        let query = `
            SELECT lm.*, c.name as course_name, c.code as course_code, u.name as lecturer_name
            FROM learning_materials lm 
            LEFT JOIN courses c ON lm.course_id = c.id
            LEFT JOIN users u ON lm.lecturer_id = u.id
            WHERE 1=1
        `;
        let params = [];

        if (lecturer_id) {
            query += ' AND lm.lecturer_id = ?';
            params.push(lecturer_id);
        }

        if (course_id) {
            query += ' AND lm.course_id = ?';
            params.push(course_id);
        }

        if (class_id) {
            query += ' AND lm.class_id = ?';
            params.push(class_id);
        }

        query += ' ORDER BY lm.order_index ASC, lm.created_at DESC';

        const rows = await dbAll(query, params);
        const materials = await attachMaterialContent(rows);
        res.json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/materials', async (req, res) => {
    try {
        const { title, type, category, course_id, lecturer_id, url, description, class_id, topic_id, content, is_prerequisite } = req.body;
        
        let maxOrder = 0;
        if (topic_id) {
            const maxRow = await dbGet('SELECT MAX(order_index) as max_val FROM learning_materials WHERE topic_id = ?', [topic_id]);
            maxOrder = (maxRow?.max_val || 0) + 1;
        } else if (class_id) {
            const maxRow = await dbGet('SELECT MAX(order_index) as max_val FROM learning_materials WHERE class_id = ? AND topic_id IS NULL', [class_id]);
            maxOrder = (maxRow?.max_val || 0) + 1;
        }

        const result = await dbRun(
            'INSERT INTO learning_materials (title, type, category, course_id, lecturer_id, url, description, class_id, topic_id, order_index, content, is_prerequisite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, type, category || 'umum', course_id || null, lecturer_id, url || '', description || '', class_id || null, topic_id || null, maxOrder, null, is_prerequisite || 0]
        );
        
        const materialId = result.lastID;

        if ((type === 'quiz' || type === 'exam') && content && content.questions) {
            for (let i = 0; i < content.questions.length; i++) {
                const q = content.questions[i];
                const optionsStr = typeof q.options === 'string' ? q.options : JSON.stringify(q.options);
                await dbRun(
                    'INSERT INTO quiz_questions (material_id, question, options, correct_answer, order_index) VALUES (?, ?, ?, ?, ?)',
                    [materialId, q.question, optionsStr, q.correctAnswer, i]
                );
            }
        } else if (type === 'flashcard' && content && content.flashcards) {
            for (let i = 0; i < content.flashcards.length; i++) {
                const c = content.flashcards[i];
                await dbRun(
                    'INSERT INTO flashcards (material_id, front, back, order_index) VALUES (?, ?, ?, ?)',
                    [materialId, c.front, c.back, i]
                );
            }
        }

        res.json({ id: materialId, message: 'Material added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/materials/:id', async (req, res) => {
    try {
        const materialId = req.params.id;
        const { title, type, category, course_id, url, description, topic_id, content, is_prerequisite } = req.body;
        
        await dbRun(
            `UPDATE learning_materials SET 
                title = ?, type = ?, category = ?, course_id = ?, url = ?, 
                description = ?, topic_id = ?, is_prerequisite = ?
             WHERE id = ?`,
            [title, type, category || 'umum', course_id || null, url || '', description || '', topic_id || null, is_prerequisite || 0, materialId]
        );

        if (type === 'quiz' || type === 'exam') {
            await dbRun('DELETE FROM quiz_questions WHERE material_id = ?', [materialId]);
            if (content && content.questions) {
                for (let i = 0; i < content.questions.length; i++) {
                    const q = content.questions[i];
                    const optionsStr = typeof q.options === 'string' ? q.options : JSON.stringify(q.options);
                    await dbRun(
                        'INSERT INTO quiz_questions (material_id, question, options, correct_answer, order_index) VALUES (?, ?, ?, ?, ?)',
                        [materialId, q.question, optionsStr, q.correctAnswer, i]
                    );
                }
            }
        } else if (type === 'flashcard') {
            await dbRun('DELETE FROM flashcards WHERE material_id = ?', [materialId]);
            if (content && content.flashcards) {
                for (let i = 0; i < content.flashcards.length; i++) {
                    const c = content.flashcards[i];
                    await dbRun(
                        'INSERT INTO flashcards (material_id, front, back, order_index) VALUES (?, ?, ?, ?)',
                        [materialId, c.front, c.back, i]
                    );
                }
            }
        }

        res.json({ message: 'Material updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/materials/:id', async (req, res) => {
    try {
        await dbRun('DELETE FROM learning_materials WHERE id = ?', [req.params.id]);
        res.json({ message: 'Material deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 11. CALENDAR EVENTS
// ========================
app.get('/api/calendar/events', async (req, res) => {
    try {
        const { lab_id, academic_year, semester, lecturer_id, class_id } = req.query;
        let query = `
            SELECT ce.*, u.name as lecturer_name, l.name as lab_name, COALESCE(ce.class_name, cl.name) as class_name
            FROM calendar_events ce
            LEFT JOIN users u ON ce.lecturer_id = u.id
            LEFT JOIN laboratories l ON ce.lab_id = l.id
            LEFT JOIN classes cl ON ce.class_id = cl.id
            WHERE 1=1
        `;
        const params = [];
        if (lab_id && lab_id !== 'all') { query += ' AND ce.lab_id = ?'; params.push(lab_id); }
        if (academic_year) { query += ' AND ce.academic_year = ?'; params.push(academic_year); }
        if (semester) { query += ' AND ce.semester = ?'; params.push(semester); }
        if (lecturer_id && lecturer_id !== 'all') { query += ' AND ce.lecturer_id = ?'; params.push(lecturer_id); }
        if (class_id && class_id !== 'all') { query += ' AND ce.class_id = ?'; params.push(class_id); }
        
        query += ' ORDER BY ce.start_time';
        const rows = await dbAll(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/calendar/events', async (req, res) => {
    try {
        const { title, description, event_date, start_time, end_time, location, lab_id, class_id, lecturer_id, event_type, academic_year, semester, day_of_week, class_name } = req.body;
        
        // Validation: End time must be greater than start time
        if (start_time >= end_time) {
            return res.status(400).json({ error: 'Jam selesai harus lebih besar dari jam mulai' });
        }
        
        // Overlap verification: Same lab, day, academic year, semester & overlapping time interval
        const overlaps = await dbAll(
            `SELECT id FROM calendar_events 
             WHERE lab_id = ? AND day_of_week = ? AND academic_year = ? AND semester = ?
             AND start_time < ? AND end_time > ?`,
            [lab_id, day_of_week, academic_year, semester, end_time, start_time]
        );
        
        if (overlaps.length > 0) {
            return res.status(400).json({ error: 'Laboratorium digunakan di Jam tersebut' });
        }
        
        const finalDate = event_date && event_date.trim() !== '' ? event_date : '1970-01-01';
        
        const result = await dbRun(
            'INSERT INTO calendar_events (title, description, event_date, start_time, end_time, location, lab_id, class_id, lecturer_id, event_type, academic_year, semester, day_of_week, class_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [title, description, finalDate, start_time, end_time, location, lab_id, class_id || null, lecturer_id, event_type || 'practicum', academic_year, semester, day_of_week, class_name]
        );
        
        res.json({ id: result.lastID, message: 'Event created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/calendar/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, start_time, end_time, location, lab_id, class_id, lecturer_id, event_type, academic_year, semester, day_of_week, class_name } = req.body;
        
        // Validation: End time must be greater than start time
        if (start_time >= end_time) {
            return res.status(400).json({ error: 'Jam selesai harus lebih besar dari jam mulai' });
        }
        
        // Overlap verification: Same lab, day, academic year, semester & overlapping time interval (excluding self)
        const overlaps = await dbAll(
            `SELECT id FROM calendar_events 
             WHERE lab_id = ? AND day_of_week = ? AND academic_year = ? AND semester = ?
             AND start_time < ? AND end_time > ? AND id != ?`,
            [lab_id, day_of_week, academic_year, semester, end_time, start_time, id]
        );
        
        if (overlaps.length > 0) {
            return res.status(400).json({ error: 'Laboratorium digunakan di Jam tersebut' });
        }
        
        const finalDate = event_date && event_date.trim() !== '' ? event_date : '1970-01-01';
        
        await dbRun(
            'UPDATE calendar_events SET title=?, description=?, event_date=?, start_time=?, end_time=?, location=?, lab_id=?, class_id=?, lecturer_id=?, event_type=?, academic_year=?, semester=?, day_of_week=?, class_name=? WHERE id=?',
            [title, description, finalDate, start_time, end_time, location, lab_id, class_id || null, lecturer_id, event_type, academic_year, semester, day_of_week, class_name, id]
        );
        res.json({ message: 'Event updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/calendar/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbRun('DELETE FROM calendar_events WHERE id = ?', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 12. AUDIT TRAIL
// ========================
app.get('/api/audit-trail', async (req, res) => {
    try {
        const rows = await dbAll('SELECT at2.*, u.name as user_name FROM audit_trail at2 LEFT JOIN users u ON at2.user_id = u.id ORDER BY at2.created_at DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 13. ANALYTICS / DASHBOARD STATS
// ========================
app.get('/api/analytics/summary', async (req, res) => {
    try {
        const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
        const totalLecturers = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "lecturer" AND is_active = 1');
        const totalInventory = await dbGet('SELECT COUNT(*) as count FROM inventory');
        const totalLoans = await dbGet('SELECT COUNT(*) as count FROM loans WHERE status = "borrowed"');
        const totalWorksheets = await dbGet('SELECT COUNT(*) as count FROM lab_worksheets');
        const totalLabs = await dbGet('SELECT COUNT(*) as count FROM laboratories WHERE is_active = 1');
        const totalCourses = await dbGet('SELECT COUNT(*) as count FROM courses WHERE is_active = 1');
        const totalClasses = await dbGet('SELECT COUNT(*) as count FROM classes WHERE is_active = 1');
        const totalMaterials = await dbGet('SELECT COUNT(*) as count FROM learning_materials');
        const avgQuiz = await dbGet('SELECT AVG(score) as avg FROM quiz_results');
        const lowStock = await dbAll('SELECT * FROM inventory WHERE stock <= min_stock');
        const recentAudit = await dbAll('SELECT at2.*, u.name as user_name FROM audit_trail at2 LEFT JOIN users u ON at2.user_id = u.id ORDER BY at2.created_at DESC LIMIT 5');

        res.json({
            total_users: totalUsers.count,
            total_lecturers: totalLecturers.count,
            total_inventory: totalInventory.count,
            active_loans: totalLoans.count,
            total_worksheets: totalWorksheets.count,
            total_labs: totalLabs.count,
            total_courses: totalCourses.count,
            total_classes: totalClasses.count,
            total_materials: totalMaterials.count,
            avg_quiz_score: Math.round(avgQuiz.avg || 0),
            low_stock_items: lowStock,
            recent_activity: recentAudit,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/dashboard/student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const activeLoans = await dbGet('SELECT COUNT(*) as count FROM loans WHERE user_id = ? AND status = "borrowed"', [id]);
        const tasksPending = await dbGet('SELECT COUNT(*) as count FROM lab_worksheets WHERE student_id = ? AND status = "submitted"', [id]);
        const avgQuiz = await dbGet('SELECT AVG(score) as avg FROM quiz_results WHERE student_id = ?', [id]);
        const enrolledClasses = await dbAll(`
            SELECT cl.*, co.name as course_name, l.name as lab_name, u.name as lecturer_name
            FROM class_students cs
            JOIN classes cl ON cs.class_id = cl.id
            LEFT JOIN courses co ON cl.course_id = co.id
            LEFT JOIN laboratories l ON cl.lab_id = l.id
            LEFT JOIN users u ON cl.lecturer_id = u.id
            WHERE cs.student_id = ? AND cs.status = 'active'
        `, [id]);
        
        const rejectedEnrollments = await dbAll(`
            SELECT cs.id, cs.rejection_reason, cl.name as class_name, co.name as course_name, cs.enrolled_at
            FROM class_students cs
            JOIN classes cl ON cs.class_id = cl.id
            LEFT JOIN courses co ON cl.course_id = co.id
            WHERE cs.student_id = ? AND cs.status = 'rejected'
            ORDER BY cs.enrolled_at DESC
        `, [id]);

        res.json({
            active_loans: activeLoans.count,
            tasks_pending: tasksPending.count,
            avg_quiz: avgQuiz.avg || 0,
            enrolled_classes: enrolledClasses,
            rejected_enrollments: rejectedEnrollments
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 14. MACHINE LEARNING (Teachable Machine)
// ========================
app.get('/api/ml/predictions', async (req, res) => {
    try {
        const rows = await dbAll('SELECT ml.*, u.name as user_name FROM ml_predictions ml LEFT JOIN users u ON ml.user_id = u.id ORDER BY ml.created_at DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ml/predictions', async (req, res) => {
    try {
        const { user_id, result_label, confidence, image_url } = req.body;
        const result = await dbRun(
            'INSERT INTO ml_predictions (user_id, result_label, confidence, image_url) VALUES (?, ?, ?, ?)',
            [user_id, result_label, confidence, image_url]
        );
        res.json({ id: result.lastID, message: 'Prediction logged' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 15. AI QUIZ GENERATOR (Gemini)
// ========================
app.post('/api/quiz/generate', upload.single('file'), async (req, res) => {
    try {
        const { user_id, material_id, url } = req.body;

        // Check Quota
        if (user_id) {
            const user = await dbGet('SELECT llm_usage, llm_quota FROM users WHERE id = ?', [user_id]);
            if (user && user.llm_usage >= user.llm_quota) {
                return res.status(403).json({ error: 'Quota LLM Anda telah habis. Silakan hubungi admin.' });
            }
        }

        let dataBuffer;
        if (req.file) {
            dataBuffer = req.file.buffer;
        } else {
            let pdfUrl = url;
            if (material_id) {
                const material = await dbGet('SELECT url FROM learning_materials WHERE id = ?', [material_id]);
                if (!material) return res.status(404).json({ error: 'Material PDF tidak ditemukan' });
                pdfUrl = material.url;
            }
            if (!pdfUrl) return res.status(400).json({ error: 'Tidak ada file PDF yang diunggah atau dipilih' });

            if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
                const response = await fetch(pdfUrl);
                const arrayBuffer = await response.arrayBuffer();
                dataBuffer = Buffer.from(arrayBuffer);
            } else {
                // Local file path
                const resolvedPath = join(process.cwd(), pdfUrl.startsWith('/') ? pdfUrl.substring(1) : pdfUrl);
                const fs = await import('fs/promises');
                dataBuffer = await fs.readFile(resolvedPath);
            }
        }

        // 1. Extract text from PDF
        const pdfData = await pdf(dataBuffer);
        const text = pdfData.text;

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ error: 'Materi PDF kosong atau tidak dapat dibaca' });
        }

        // 2. Prepare Gemini Prompt
        const genAI = await getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Berdasarkan teks dari dokumen laboratorium medis berikut, buatkan 5 soal pilihan ganda (Multiple Choice Questions) yang relevan untuk mahasiswa Teknologi Laboratorium Medis (TLM).
            Setiap soal harus memiliki 4 pilihan (A, B, C, D) dan kunci jawaban yang benar.
            Format output harus berupa JSON ARRAY murni seperti contoh ini:
            [
              {
                "question": "Apa fungsi utama dari reagen benedict?",
                "options": ["Mendeteksi glukosa", "Mendeteksi albumin", "Mendeteksi bilirubin", "Mendeteksi keton"],
                "answer": "A"
              }
            ]
            
            TEKS DOKUMEN:
            ${text.substring(0, 10000)}
        `;

        // 3. Generate Content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text();

        // Clean JSON text if Gemini adds markdown markers
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        const questions = JSON.parse(jsonText);

        // Success - update quota
        if (user_id) {
            await dbRun('UPDATE users SET llm_usage = llm_usage + 1 WHERE id = ?', [user_id]);
        }

        res.json({ questions });

    } catch (err) {
        console.error('AI Quiz Gen Error:', err);
        res.status(500).json({ error: 'Failed to generate questions. ' + err.message });
    }
});

// ========================
// 16. SUPPORT TICKETS
// ========================
app.get('/api/support/tickets', async (req, res) => {
    try {
        const rows = await dbAll(`
            SELECT st.*, u.name as user_name, l.name as lab_name
            FROM support_tickets st
            LEFT JOIN users u ON st.user_id = u.id
            LEFT JOIN laboratories l ON st.lab_id = l.id
            ORDER BY st.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/support/tickets', async (req, res) => {
    try {
        const { user_id, lab_id, subject, description, category, priority } = req.body;
        const result = await dbRun(
            'INSERT INTO support_tickets (user_id, lab_id, subject, description, category, priority) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, lab_id, subject, description, category || 'general', priority || 'medium']
        );
        res.json({ id: result.lastID, message: 'Ticket created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 17. SYSTEM SETTINGS
// ========================
app.get('/api/settings/ai', async (req, res) => {
    try {
        const rows = await dbAll('SELECT key, value FROM settings WHERE key LIKE "GEMINI_%"');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/settings/ai', async (req, res) => {
    try {
        const { key, value } = req.body;
        await dbRun('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [key, value]);
        res.json({ message: 'Setting updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// 18. ALERTS & REPORTS
// ========================
app.get('/api/alerts', async (req, res) => {
    try {
        const lowStock = await dbAll(`
            SELECT id, name, stock, min_stock, unit 
            FROM inventory 
            WHERE stock <= min_stock
        `);
        const expiryWarning = await dbAll(`
            SELECT id, name, expired_date, stock, unit 
            FROM inventory 
            WHERE expired_date IS NOT NULL 
            AND expired_date <= date('now', '+3 months')
            ORDER BY expired_date ASC
        `);
        const overdueLoans = await dbAll(`
            SELECT l.id, u.name as user_name, i.name as item_name, l.loan_date 
            FROM loans l
            JOIN users u ON l.user_id = u.id
            JOIN inventory i ON l.item_id = i.id
            WHERE l.status = 'borrowed' 
            AND l.loan_date <= date('now', '-7 days') -- Example rule: overdue if borrowed > 7 days
        `);
        res.json({
            lowStock,
            expiryWarning,
            overdueLoans
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports', async (req, res) => {
    try {
        const totalItems = await dbGet('SELECT COUNT(*) as count FROM inventory');
        const activeLoans = await dbGet('SELECT COUNT(*) as count FROM loans WHERE status = "borrowed"');
        const damagedItemsCount = await dbGet('SELECT COUNT(*) as count FROM loans WHERE final_condition != "Bagus"');
        
        // Simple mutation aggregate (just counts for now)
        const totalUsage = await dbGet('SELECT SUM(quantity_changed) as total FROM inventory_transactions WHERE transaction_type = "usage"');

        res.json({
            summary: {
                totalInventory: totalItems.count,
                activeLoans: activeLoans.count,
                damagedReturns: damagedItemsCount.count,
                totalUsage: Math.abs(totalUsage.total || 0)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// START SERVER
// ========================
app.listen(PORT, () => {
    console.log(`🚀 SIL API Server running on http://localhost:${PORT}`);
    console.log(`📋 Endpoints: auth, users, laboratories, courses, classes, inventory, loans, worksheets, quiz, materials, calendar, audit, analytics, support`);
});
