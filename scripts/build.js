const fs = require('fs');
const path = require('path');

const rootDir = '/home/shaun/drawio-translate'; // Note: Dir name on disk remains the same for stability
const appDir = path.join(rootDir, 'app');
const promptsDir = path.join(rootDir, 'prompts');
const outputFile = path.join(rootDir, 'FlowArchitect_v7.html');

console.log('--- FlowArchitect v7.2 Builder (Optimized) ---');

let html = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');

// 1. Inline CSS
const cssMatch = html.match(/<link rel="stylesheet" href="css\/style.css">/);
if (cssMatch) {
    const cssPath = path.join(appDir, 'css/style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    html = html.replace(cssMatch[0], `<style>\n${cssContent}\n</style>`);
    console.log('✓ Inlined CSS');
} else {
    // Fallback for general search
    const cssGeneralMatch = html.match(/<link rel="stylesheet" href="([^"]+)">/);
    if (cssGeneralMatch) {
         const cssPath = path.join(appDir, cssGeneralMatch[1]);
         const cssContent = fs.readFileSync(cssPath, 'utf8');
         html = html.replace(cssGeneralMatch[0], `<style>\n${cssContent}\n</style>`);
         console.log('✓ Inlined CSS (Generic Match)');
    }
}

// 2. Inline Logo as Base64
const logoPath = path.join(appDir, 'assets/flowarchitect_logo.png');
if (fs.existsSync(logoPath)) {
    const logoData = fs.readFileSync(logoPath).toString('base64');
    html = html.replace('./flowarchitect_logo.png', `data:image/png;base64,${logoData}`);
    console.log('✓ Inlined Logo');
}

// 3. Inline Scripts
const scriptRegex = /<script src="([^"]+)"><\/script>/g;
let match;
const scriptsToInline = [];
while ((match = scriptRegex.exec(html)) !== null) {
    scriptsToInline.push({ full: match[0], src: match[1].split('?')[0] });
}

for (const script of scriptsToInline) {
    const scriptPath = path.join(appDir, script.src);
    if (fs.existsSync(scriptPath)) {
        let scriptContent = fs.readFileSync(scriptPath, 'utf8');
        // Sanitize for HTML insertion
        scriptContent = scriptContent.replace(/<\/script>/g, '<\\/script>');
        html = html.replace(script.full, `<script>\n${scriptContent}\n</script>`);
        console.log(`✓ Inlined ${script.src}`);
    } else {
        console.warn(`! Script not found: ${scriptPath}`);
    }
}

// 4. Inject System Prompt
const promptPath = path.join(promptsDir, 'PROMPT_TEMPLATE.md');
if (fs.existsSync(promptPath)) {
    const promptContent = fs.readFileSync(promptPath, 'utf8');
    html = html.replace('<div id="prompt-storage" style="display:none;"></div>', 
                       `<div id="prompt-storage" style="display:none;">${promptContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`);
    console.log('✓ Injected latest PROMPT_TEMPLATE.md');
}

fs.writeFileSync(outputFile, html);
console.log(`\nDONE: Final portable release generated at ${outputFile}`);
