const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function getRelativeDepth(filePath) {
    const depth = filePath.split(path.sep).length - filePath.indexOf('pages'.split('')[0]);
    // It's a heuristic, but easier to just use regex to find the MobileContainer import and reuse its relative prefix
}

walkDir(path.join(__dirname, 'src', 'pages'), (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // 1. Replace MobileContainer import
    const mobileImportRegex = /import\s+MobileContainer\s+from\s+['"](.+)\/MobileContainer['"];?/g;
    const match = mobileImportRegex.exec(content);
    if (match) {
        const relativePath = match[1];
        content = content.replace(mobileImportRegex, `import DesktopLayout from '${relativePath}/DesktopLayout';`);
        changed = true;
    }

    // 2. Remove BottomNav import
    const bottomNavRegex = /import\s+BottomNav\s+from\s+['"].+BottomNav['"];?\s*\n?/g;
    if (bottomNavRegex.test(content)) {
        content = content.replace(bottomNavRegex, '');
        changed = true;
    }

    // 3. Replace <MobileContainer> with <DesktopLayout title="Halaman">
    if (content.includes('<MobileContainer>')) {
        content = content.replace(/<MobileContainer>/g, '<DesktopLayout title="Menu">');
        changed = true;
    }

    // 4. Replace </MobileContainer> with </DesktopLayout>
    if (content.includes('</MobileContainer>')) {
        content = content.replace(/<\/MobileContainer>/g, '</DesktopLayout>');
        changed = true;
    }

    // 5. Remove <BottomNav />
    if (content.includes('<BottomNav')) {
        content = content.replace(/<BottomNav\s*\/>\s*\n?/g, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
});
