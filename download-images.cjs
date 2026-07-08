const https = require('https');
const fs = require('fs');
const path = require('path');

const urls = [
    'https://bexon-react.vercel.app/images/shape/pattern-bg.webp',
    'https://bexon-react.vercel.app/images/service/service-ad.webp',
    'https://bexon-react.vercel.app/images/cta/cta-bg.webp',
    'https://bexon-react.vercel.app/images/shape/pattern-2.svg',
    'https://bexon-react.vercel.app/images/bg/map.svg'
];

const destDir = path.join(__dirname, 'public/images/bexon');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

urls.forEach(url => {
    const fileName = path.basename(url);
    const filePath = path.join(destDir, fileName);
    https.get(url, (res) => {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => console.log('Downloaded', fileName));
    });
});
