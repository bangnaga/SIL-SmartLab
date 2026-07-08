const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'public', 'LandingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Color mappings for dark mode
const replacements = [
    { from: /bg-white/g, to: 'bg-white dark:bg-slate-900' },
    { from: /text-slate-900/g, to: 'text-slate-900 dark:text-white' },
    { from: /text-slate-800/g, to: 'text-slate-800 dark:text-slate-200' },
    { from: /text-slate-600/g, to: 'text-slate-600 dark:text-slate-400' },
    { from: /text-slate-500/g, to: 'text-slate-500 dark:text-slate-400' },
    { from: /bg-slate-50/g, to: 'bg-slate-50 dark:bg-slate-800' },
    { from: /bg-slate-100/g, to: 'bg-slate-100 dark:bg-slate-800' },
    { from: /bg-slate-200/g, to: 'bg-slate-200 dark:bg-slate-700' },
    { from: /border-slate-100/g, to: 'border-slate-100 dark:border-slate-800' },
    { from: /border-slate-200/g, to: 'border-slate-200 dark:border-slate-700' },
    { from: /bg-slate-900\/20/g, to: 'bg-slate-900/20 dark:bg-white/10' },
    { from: /group-hover:bg-slate-900\/40/g, to: 'group-hover:bg-slate-900/40 dark:group-hover:bg-white/20' },
    { from: /bg-blue-50/g, to: 'bg-blue-50 dark:bg-blue-900/30' },
    { from: /shadow-sm/g, to: 'shadow-sm dark:shadow-none' },
    { from: /shadow-lg/g, to: 'shadow-lg dark:shadow-none' },
    { from: /shadow-2xl/g, to: 'shadow-2xl dark:shadow-none' },
];

// Clean up any double replacements if we run it multiple times
const cleanup = [
    { from: /bg-white dark:bg-slate-900 dark:bg-slate-900/g, to: 'bg-white dark:bg-slate-900' },
    { from: /text-slate-900 dark:text-white dark:text-white/g, to: 'text-slate-900 dark:text-white' },
];

replacements.forEach(r => {
    content = content.replace(r.from, r.to);
});

cleanup.forEach(r => {
    content = content.replace(r.from, r.to);
});

// A few specific manual adjustments
// make bg-white dark:bg-slate-900 not duplicate in places where it might
content = content.replace(/className="bg-white/g, 'className="bg-white dark:bg-slate-900');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dark mode classes applied to LandingPage.jsx');
