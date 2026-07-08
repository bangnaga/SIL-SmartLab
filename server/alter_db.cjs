const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sil.db');

db.serialize(() => {
    db.run("ALTER TABLE laboratories ADD COLUMN ip_camera_port TEXT;", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column already exists.');
            } else {
                console.error(err.message);
            }
        } else {
            console.log('Column ip_camera_port added successfully.');
        }
    });
});

db.close();
