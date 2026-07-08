const https = require('https');

https.get('https://bexon-react.vercel.app/', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        // Find font-family declarations
        const fontMatches = data.match(/font-family:[^;\"\}]+/gi);
        if (fontMatches) {
            console.log("FONTS FOUND IN HTML:", [...new Set(fontMatches)]);
        }

        // Find next.js class names that might have font-family
        const nextFonts = data.match(/__className_[a-zA-Z0-9]+/g);
        if (nextFonts) {
            console.log("NEXT FONTS:", [...new Set(nextFonts)]);
        }

        // Find all menu items
        // Look for <nav> or links in header
        const navText = data.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
        if (navText) {
            let cleanText = navText[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            console.log("NAV TEXT:", cleanText);
        }
    });
});
