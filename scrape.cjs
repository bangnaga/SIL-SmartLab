const https = require('https');

https.get('https://bexon-react.vercel.app/', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {

        // fetch CSS files and find font family
        const cssLinks = data.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/g);
        if (cssLinks) {
            console.log("CSS LINKS:", cssLinks);
        }
        const chunksCss = data.match(/href="(\/_next\/static\/chunks\/[^"]+\.css)"/g);
        if (chunksCss) {
            chunksCss.forEach(c => {
                let url = 'https://bexon-react.vercel.app' + c.split('"')[1];
                https.get(url, (res) => {
                    let cssData = '';
                    res.on('data', d => cssData += d);
                    res.on('end', () => {
                        let f = cssData.match(/font-family:([^;}]+)/g);
                        if (f) console.log("FONTS in", url, [...new Set(f)]);

                        let color = cssData.match(/--[\w-]+:([^;}]+)/g);
                        if (color && color.length > 0) {
                            // console.log("Vars", color.slice(0, 10)); // just to see some root variables
                        }
                    });
                });
            });
        }
    });
});
