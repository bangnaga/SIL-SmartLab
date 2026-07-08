const fs = require('fs');
const https = require('https');
const path = require('path');

const dirBase = path.join(__dirname, 'public/images/bexon/service');
const dirShape = path.join(__dirname, 'public/images/bexon/shape');

if (!fs.existsSync(dirBase)) fs.mkdirSync(dirBase, { recursive: true });
if (!fs.existsSync(dirShape)) fs.mkdirSync(dirShape, { recursive: true });

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

Promise.all([
    download('https://bexon-react.vercel.app/images/service/h9-service-1.webp', path.join(dirBase, 'h9-service-1.webp')),
    download('https://bexon-react.vercel.app/images/service/h9-service-2.webp', path.join(dirBase, 'h9-service-2.webp')),
    download('https://bexon-react.vercel.app/images/service/h9-service-3.webp', path.join(dirBase, 'h9-service-3.webp')),
    download('https://bexon-react.vercel.app/images/service/service-6.webp', path.join(dirBase, 'service-6.webp')),
    download('https://bexon-react.vercel.app/images/shape/pattern-3.svg', path.join(dirShape, 'pattern-3.svg')),
    download('https://bexon-react.vercel.app/images/shape/h7-testimonial-shape-blur.svg', path.join(dirShape, 'h7-testimonial-shape-blur.svg'))
])
    .then(() => console.log('Downloaded service images'))
    .catch(console.error);
