import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../sil.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database at:', dbPath);
    runMigration();
});

// Promisify db runs/gets
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
    });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

async function runMigration() {
    try {
        console.log('Starting migration...');

        // 1. Create quiz_questions table
        await dbRun(`
            CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY(material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
            )
        `);
        console.log('Table quiz_questions is ready.');

        // 2. Create flashcards table
        await dbRun(`
            CREATE TABLE IF NOT EXISTS flashcards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                front TEXT NOT NULL,
                back TEXT NOT NULL,
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY(material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
            )
        `);
        console.log('Table flashcards is ready.');

        // 3. Migrate existing learning materials JSON content
        const materials = await dbAll(`
            SELECT id, type, content FROM learning_materials 
            WHERE type IN ('quiz', 'exam', 'flashcard')
        `);

        console.log(`Found ${materials.length} potential materials to migrate.`);

        for (const mat of materials) {
            if (!mat.content) continue;

            let parsedContent;
            try {
                parsedContent = JSON.parse(mat.content);
            } catch (e) {
                console.warn(`Failed to parse content for material ID ${mat.id}:`, e.message);
                continue;
            }

            if (mat.type === 'quiz' || mat.type === 'exam') {
                const questions = parsedContent.questions || [];
                if (questions.length > 0) {
                    // Check if already migrated
                    const existing = await dbGet('SELECT id FROM quiz_questions WHERE material_id = ?', [mat.id]);
                    if (!existing) {
                        console.log(`Migrating ${questions.length} questions for Quiz material ID ${mat.id}...`);
                        for (let i = 0; i < questions.length; i++) {
                            const q = questions[i];
                            const optionsStr = typeof q.options === 'string' ? q.options : JSON.stringify(q.options);
                            await dbRun(`
                                INSERT INTO quiz_questions (material_id, question, options, correct_answer, order_index)
                                VALUES (?, ?, ?, ?, ?)
                            `, [mat.id, q.question, optionsStr, q.correctAnswer, i]);
                        }
                    } else {
                        console.log(`Quiz material ID ${mat.id} questions already migrated.`);
                    }
                }
            } else if (mat.type === 'flashcard') {
                const cards = parsedContent.flashcards || [];
                if (cards.length > 0) {
                    // Check if already migrated
                    const existing = await dbGet('SELECT id FROM flashcards WHERE material_id = ?', [mat.id]);
                    if (!existing) {
                        console.log(`Migrating ${cards.length} flashcards for Flashcard material ID ${mat.id}...`);
                        for (let i = 0; i < cards.length; i++) {
                            const c = cards[i];
                            await dbRun(`
                                INSERT INTO flashcards (material_id, front, back, order_index)
                                VALUES (?, ?, ?, ?)
                            `, [mat.id, c.front, c.back, i]);
                        }
                    } else {
                        console.log(`Flashcard material ID ${mat.id} cards already migrated.`);
                    }
                }
            }
        }

        console.log('Migration completed successfully!');
        db.close();
    } catch (error) {
        console.error('Migration failed:', error);
        db.close();
        process.exit(1);
    }
}
