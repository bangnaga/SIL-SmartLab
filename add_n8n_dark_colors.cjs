const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'public', 'LandingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    { from: /dark:bg-slate-900/g, to: 'dark:bg-[#0E0918]' },
    { from: /dark:bg-slate-800/g, to: 'dark:bg-[#1B1728]' },
    { from: /dark:bg-slate-700/g, to: 'dark:bg-[#2B2639]' },
    { from: /dark:border-slate-800/g, to: 'dark:border-[#1B1728]' },
    { from: /dark:border-slate-700/g, to: 'dark:border-[#2B2639]' },
];

replacements.forEach(r => {
    content = content.replace(r.from, r.to);
});

// Since we have n8n in tailwind.config we can use dark:bg-n8n-base etc.
// But direct hex is fine too: dark:bg-[#0E0918], let's use the semantic classes.
content = content.replace(/dark:bg-\[\#0E0918\]/g, 'dark:bg-n8n-base');
content = content.replace(/dark:bg-\[\#1B1728\]/g, 'dark:bg-n8n-surface');
content = content.replace(/dark:bg-\[\#2B2639\]/g, 'dark:bg-n8n-lighter');
content = content.replace(/dark:border-\[\#1B1728\]/g, 'dark:border-n8n-surface');
content = content.replace(/dark:border-\[\#2B2639\]/g, 'dark:border-n8n-lighter');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied n8n dark colors to LandingPage.jsx');
