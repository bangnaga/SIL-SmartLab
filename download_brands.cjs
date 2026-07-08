const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public/images/bexon/brands');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const download = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(resolve);
        });
    }).on('error', err => {
        fs.unlink(dest, () => { });
        reject(err.message);
    });
});

Promise.all([1, 2, 3, 4, 5, 6].map(i =>
    download(`https://bexon-react.vercel.app/images/brands/brand-${i}.webp`, path.join(dir, `brand-${i}.webp`))
))
    .then(() => console.log('Downloaded brands'))
    .catch(console.error);
