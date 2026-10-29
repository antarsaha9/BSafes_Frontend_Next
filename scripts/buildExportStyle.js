/**
 * Builds public/exportStyle/: the stylesheets and fonts that exported pages use,
 * so an export opened in a web browser looks like the app (offline, without the app).
 * The export copies this folder into each export as "bsafes-style/" (see lib/exportStyle.js).
 *
 *   app.css      the app's own stylesheets (Bootstrap theme, Froala content styles, fonts, icons)
 *   export.css   styles/exportPage.css: the page layout rules of the app (its CSS-module classes)
 *   fonts/       the font files the stylesheets use
 *   files.json   [{ path, sha256, size }] of every file above
 *
 * Runs before `npm run dev` / `npm run build`; run it by hand with `node scripts/buildExportStyle.js`.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectDir = path.join(__dirname, '..');
const outDir = path.join(projectDir, 'public', 'exportStyle');

// In the same order the app loads them (pages/_app.jsx, lib/importStyles.js, lib/importFonts.js).
const APP_CSS_SOURCES = [
    'styles/materia.css',
    'node_modules/font-awesome/css/font-awesome.min.css',
    'node_modules/froala-editor/css/froala_style.min.css',
    'node_modules/@fontsource-variable/edu-sa-beginner/index.css',
    'node_modules/@fontsource-variable/roboto-flex/index.css',
    'node_modules/@fontsource-variable/oswald/index.css',
    'node_modules/@fontsource-variable/montserrat/index.css',
    'node_modules/@fontsource-variable/noto-serif/index.css',
    'node_modules/@fontsource-variable/dancing-script/index.css',
    'styles/react-tagsinput-bsafes.css',
    'styles/froala-editor-bsafes.css',
    'public/css/froalaEditorCSS/video.css',
    'styles/bootstrapOverride.css',
];
const EXPORT_CSS_SOURCE = 'styles/exportPage.css';

// Older font formats every current browser skips (they would only make the export bigger).
const SKIPPED_FONT_FORMATS = new Set(['.eot', '.svg', '.ttf', '.otf']);

/** Copies the files a stylesheet points to into fonts/ and points the stylesheet at the copies. */
function rewriteUrls(css, sourceFile, copiedFonts) {
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (match, quote, url) => {
        if (/^(data:|https?:|#)/.test(url)) return match;
        const cleanUrl = url.split(/[?#]/)[0];
        const fromPath = path.resolve(path.dirname(sourceFile), cleanUrl);
        const fileName = path.basename(cleanUrl);
        if (SKIPPED_FONT_FORMATS.has(path.extname(fileName).toLowerCase())) return 'url(fonts/missing)';
        if (!fs.existsSync(fromPath)) {
            console.warn(`buildExportStyle: ${path.relative(projectDir, sourceFile)} points to a missing file: ${url}`);
            return match;
        }
        copiedFonts.set(fileName, fromPath);
        return `url(fonts/${fileName})`;
    });
}

function build() {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(outDir, 'fonts'), { recursive: true });

    const copiedFonts = new Map();
    const parts = APP_CSS_SOURCES.map((relPath) => {
        const sourceFile = path.join(projectDir, relPath);
        // The Google Fonts import needs the network; Roboto comes from export.css instead.
        const css = fs.readFileSync(sourceFile, 'utf8').replace(/@import\s+url\([^)]*fonts\.googleapis\.com[^)]*\)\s*;?/g, '');
        return `/* ${relPath} */\n${rewriteUrls(css, sourceFile, copiedFonts)}`;
    });
    fs.writeFileSync(path.join(outDir, 'app.css'), parts.join('\n\n'));

    const exportCssFile = path.join(projectDir, EXPORT_CSS_SOURCE);
    fs.writeFileSync(path.join(outDir, 'export.css'), rewriteUrls(fs.readFileSync(exportCssFile, 'utf8'), exportCssFile, copiedFonts));

    for (const [fileName, fromPath] of copiedFonts) {
        fs.copyFileSync(fromPath, path.join(outDir, 'fonts', fileName));
    }

    const files = ['app.css', 'export.css', ...[...copiedFonts.keys()].sort().map((name) => `fonts/${name}`)].map((relPath) => {
        const data = fs.readFileSync(path.join(outDir, relPath));
        return { path: relPath, sha256: crypto.createHash('sha256').update(data).digest('hex'), size: data.length };
    });
    fs.writeFileSync(path.join(outDir, 'files.json'), JSON.stringify(files, null, 2));

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    console.log(`buildExportStyle: wrote ${files.length} files (${(totalSize / 1024 / 1024).toFixed(1)} MB) to public/exportStyle/`);
}

build();
