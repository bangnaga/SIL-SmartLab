const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sil.db');

db.serialize(() => {
    db.run("ALTER TABLE users ADD COLUMN last_active DATETIME;", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column last_active already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column last_active added successfully.');
        }
    });
});

db.close();
