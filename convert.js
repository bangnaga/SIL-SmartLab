import fs from 'fs';

const jsx = fs.readFileSync('src/pages/public/LandingPage.jsx', 'utf8');

let html = jsx;

// 1. Remove imports
html = html.replace(/import .*;?\n/g, '');

// 2. Extract return content
const returnMatch = html.match(/return \([\s\S]*?(<div[^>]*>[\s\S]*?)(\);|\n\};)/);
if (returnMatch) {
    html = returnMatch[1];
}

// 3. Convert motion components to standard tags
html = html.replace(/<motion\.([a-z0-9]+)/g, '<$1');
html = html.replace(/<\/motion\.([a-z0-9]+)>/g, '</$1>');
// Remove frame motion props
html = html.replace(/ (initial|animate|variants|whileInView|viewport|transition|whileHover)=\{.*?\}/g, '');

// 4. Convert Link components to <a>
html = html.replace(/<Link[^>]*to="(.*?)"([^>]*)>/g, '<a href="$1"$2>');
html = html.replace(/<\/Link>/g, '</a>');

// 5. Convert className to class
html = html.replace(/className=/g, 'class=');

// 6. Fix style objects (multiline)
html = html.replace(/style=\{\{[\s\S]*?\}\}/g, (match) => {
    if (match.includes('fontFamily')) {
        const fontMatch = match.match(/'([^']+)'/);
        return fontMatch ? `style="font-family: '${fontMatch[1]}';"` : '';
    }
    return '';
});

// 7. Lucide Icons
const iconMap = {
    ArrowRight: 'arrow-right',
    Microscope: 'microscope',
    Play: 'play',
    Facebook: 'facebook',
    Twitter: 'twitter',
    Linkedin: 'linkedin',
    Mail: 'mail',
    Moon: 'moon',
    Sun: 'sun',
    CheckCircle2: 'check-circle-2',
    ChevronRight: 'chevron-right'
};

for (const [component, lucideName] of Object.entries(iconMap)) {
    const regex = new RegExp(`<${component}\\s+([^>]*)\\/>`, 'g');
    html = html.replace(regex, `<i data-lucide="${lucideName}" $1></i>`);
    const regex2 = new RegExp(`<${component}\\/>`, 'g');
    html = html.replace(regex2, `<i data-lucide="${lucideName}"></i>`);
}

// 8. Fix JS comments
html = html.replace(/\{\/\*(.*?)\*\/\}/g, '<!-- $1 -->');

// 9. Static content helpers
html = html.replace(/\{featureTabs\.map\(\(tab, idx\) => \([\s\S]*?(<button[^>]*>[\s\S]*?<\/button>)[\s\S]*?\)\)\}/g,
    `<!-- Tab 1 -->
$1
<!-- Duplicate for other tabs -->`);

html = html.replace(/\{tab\.title\}/g, 'IT Ops');
html = html.replace(/\{tab\.action\}/g, 'can');
html = html.replace(/\{tab\.description\}/g, 'On-board new employees');
html = html.replace(/\{featureTabs\[activeFeatureTab\]\.image\}/g, 'https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/workflow_itops_5d5a4bf299.svg');
html = html.replace(/\{featureTabs\[activeFeatureTab\]\.title\}/g, 'IT Ops');

// 10. Fix conditional classes and template literals
html = html.replace(/\$\{.*? \? '([^']*)' : '([^']*)'\}/g, '$1');
html = html.replace(/\{.*? \? '([^']*)' : '([^']*)'\}/g, '$1');
html = html.replace(/class=\{`([^`]*)`\}/g, 'class="$1"');

// 11. Fix Loops (Stars & Brands)
const starSvg = '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>';
html = html.replace(/\{\[\.\.\.Array\(5\)\][\s\S]*?<\/svg>\)\}/g, starSvg.repeat(5));
html = html.replace(/\{\[1, 2, 3, 4, 5, 6\][\s\S]*?(<img[^>]*>)[\s\S]*?\)\}/g, '$1$1$1$1$1$1');

// Brands specific fixes
html = html.replace(/src=\{.*?brand-\$\{i\}\.webp`\}/g, 'src="images/bexon/brands/brand-1.webp"');
html = html.replace(/alt=\{\`Brand partner \$\{i\}( clone)?\`\}/g, 'alt="Brand image"');

// 12. Fix image paths (leading slash to relative)
html = html.replace(/src="\/images\//g, 'src="images/');
html = html.replace(/src=\{\/images\//g, 'src="images/');

// 13. Final cleanup
html = html.replace(/key=\{.*?\}/g, '');
html = html.replace(/ onClick=\{[^}]+\}/g, '');
html = html.replace(/ viewport=\{[^}]+\}/g, '');
html = html.replace(/\s*initial="[^"]*"/g, '');
html = html.replace(/\s*animate="[^"]*"/g, '');
html = html.replace(/\{scrolled \? '([^']*)' : '([^']*)'\}/g, '$2');
html = html.replace(/\{darkMode \? (<.+?>) : (<.+?>)\}/g, '$2');
html = html.replace(/\s*\}\s*class=/g, ' class=');
html = html.replace(/\s*\}\s*>/g, '>');
html = html.replace(/\s*\}\s*style=/g, ' style=');

// Fix indicator style height
html = html.replace(/<div\s+class="absolute left-0 w-1 bg-\[#FF6B6B\].*?>/g,
    '<div class="absolute left-0 w-1 bg-[#FF6B6B] rounded-sm transition-all duration-300 shadow-[0_0_10px_rgba(255,107,107,0.5)] hidden lg:block" style="height: 100px; transform: translate(-50%, 0px);">');

const boilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bexon - Landing Page Template</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'n8n-base': '#1c1e26',
                        'n8n-surface': '#252836',
                        'n8n-lighter': '#2f3346',
                    },
                    fontFamily: {
                        sans: ['Manrope', 'sans-serif'],
                        outfit: ['Outfit', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-white text-slate-800 font-sans selection:bg-blue-600/20">
    <div class="bg-white dark:bg-n8n-base min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-600/20 overflow-hidden">
        ${html}
    </div>

    <!-- Custom JS -->
    <script src="js/script.js"></script>
</body>
</html>`;

fs.writeFileSync('template/index.html', boilerplate);
console.log('template/index.html finalized successfully.');
