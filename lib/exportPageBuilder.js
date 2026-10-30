/**
 * Builds the HTML of exported pages. They use the same markup and stylesheets as the app
 * (linked from the export's style folder, see lib/exportStyle.js), so a page opened in a web
 * browser looks like it does in the app.
 * FALLBACK_STYLE keeps pages readable if the style folder is missing; the linked stylesheets
 * come after it and take over.
 */
const FALLBACK_STYLE = '<style>'
    + 'body{font-family:Roboto,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;line-height:1.5;margin:0;padding:0 16px}'
    + 'img,video{max-width:100%;height:auto} audio{width:100%}'
    + '.bsafes-topBar,.bsafes-pagePanel{max-width:1024px;margin:0 auto}'
    + '.breadcrumb{list-style:none;display:flex;flex-wrap:wrap;padding:0;gap:.5em} .breadcrumb-item+.breadcrumb-item::before{content:"\\203A";padding-right:.5em}'
    + '.react-tagsinput-tag{border:1px solid #b8b5b5;border-radius:7px;padding:2px;margin-right:2px}'
    + '.list-group{list-style:none;padding:0} .list-group-item{display:block;padding:6px 0;border-bottom:1px solid #eee}'
    + '</style>';

const TYPE_ICONS = {
    Box: 'fa-archive',
    Folder: 'fa-folder-o',
    Notebook: 'fa-book',
    Diary: 'fa-calendar',
    Page: 'fa-file-text-o',
    'Notebook Page': 'fa-file-text-o',
    'Diary Page': 'fa-file-text-o',
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

const numberWithCommas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * In the app, images and videos inside page text are placeholders that the app fills in later.
 * This turns them into normal images and video players that point to the saved files, in the
 * same form the app shows them, so the page shows them when opened in any browser.
 * `mediaByElementId` says which saved file belongs to which placeholder.
 */
export function rewriteInlineMedia(contentHtml, mediaByElementId) {
    if (!contentHtml) return '';
    const container = document.createElement('div');
    container.innerHTML = contentHtml;

    container.querySelectorAll('.bSafesImage').forEach((img) => {
        const media = mediaByElementId[img.id];
        img.removeAttribute('id');
        if (media) {
            img.setAttribute('src', media.path);
        } else {
            img.removeAttribute('src');
            img.setAttribute('alt', 'Image unavailable');
        }
    });

    // Same as the app (components/pageCommons.jsx): <span class="fr-video"><video class="bSafesVideo ...">
    container.querySelectorAll('.bSafesDownloadVideo').forEach((el) => {
        const media = mediaByElementId[el.id];
        const span = document.createElement('span');
        span.className = 'fr-video fr-dvb';
        const videoEl = document.createElement('video');
        videoEl.className = 'bSafesVideo fr-dvi fr-fvc';
        videoEl.setAttribute('controls', '');
        if (el.getAttribute('style')) videoEl.setAttribute('style', el.getAttribute('style'));
        videoEl.style.maxWidth = '100%';
        if (media) videoEl.setAttribute('src', media.path);
        span.appendChild(videoEl);
        el.replaceWith(span);
    });

    return container.innerHTML;
}

/** The start of every exported file: title and the app's stylesheets, linked from `styleHref`. */
function htmlHead(title, styleHref) {
    return [
        '<!DOCTYPE html>',
        '<html lang="en"><head><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        `<title>${escapeHtml(title || 'Untitled')}</title>`,
        FALLBACK_STYLE,
        styleHref ? `<link rel="stylesheet" href="${escapeHtml(styleHref)}app.css">` : '',
        styleHref ? `<link rel="stylesheet" href="${escapeHtml(styleHref)}export.css">` : '',
        '</head><body>',
    ].join('\n');
}

/**
 * Builds the row of "back" links shown at the top of every page and folder index,
 * e.g. "Export home › My Box › Travel Notebook". `crumbs` is a list of { title, href }.
 */
function topBarHtml(crumbs, currentTitle) {
    if (!crumbs || !crumbs.length) return '';
    const links = crumbs.map(({ title, href }) => `<li class="breadcrumb-item"><a href="${escapeHtml(href)}">${escapeHtml(title || 'Untitled')}</a></li>`);
    const current = currentTitle ? `<li class="breadcrumb-item active" aria-current="page">${escapeHtml(currentTitle)}</li>` : '';
    return `<nav class="bsafes-topBar" aria-label="breadcrumb"><ol class="breadcrumb">${links.join('')}${current}</ol></nav>`;
}

/** Items listed on each page of a folder's contents, the same as in the app. */
export const INDEX_ITEMS_PER_PAGE = 20;

/** File name of page `pageNumber` of a folder's contents: index.html, index-2.html, index-3.html, ... */
export const indexFileName = (pageNumber) => (pageNumber > 1 ? `index-${pageNumber}.html` : 'index.html');

/** Previous / page numbers / Next links between the pages of a folder's contents (Bootstrap pagination). */
function paginationHtml(pageNumber, pageCount) {
    if (pageCount <= 1) return '';
    const item = (label, number, { active = false, disabled = false, ariaLabel } = {}) => {
        const classes = `page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}`;
        const aria = ariaLabel ? ` aria-label="${ariaLabel}"` : '';
        const link = active || disabled
            ? `<span class="page-link"${aria}${active ? ' aria-current="page"' : ''}>${label}</span>`
            : `<a class="page-link" href="${indexFileName(number)}"${aria}>${label}</a>`;
        return `<li class="${classes}">${link}</li>`;
    };
    const items = [item('&laquo;', pageNumber - 1, { disabled: pageNumber === 1, ariaLabel: 'Previous' })];
    for (let n = 1; n <= pageCount; n++) items.push(item(String(n), n, { active: n === pageNumber }));
    items.push(item('&raquo;', pageNumber + 1, { disabled: pageNumber === pageCount, ariaLabel: 'Next' }));
    return `<nav aria-label="Pages"><ul class="pagination flex-wrap justify-content-center mt-3">${items.join('')}</ul></nav>`;
}

/**
 * Builds one page of a folder's contents (index.html, index-2.html, ...): a list of what's inside
 * a folder of the export, with links to open each item, and links to the other pages.
 * Used for the export's starting page and for every Box, Folder, Notebook and Diary.
 * `items` is the list for this page only: { title, typeLabel, href }. `pageNumber` / `pageCount`
 * and `totalItems` describe the whole list. `styleHref` links to the style folder.
 * It works in any browser, without the app.
 */
export function buildIndexHtml({ title, subtitle, crumbs = [], items = [], styleHref, pageNumber = 1, pageCount = 1, totalItems = items.length }) {
    const parts = [htmlHead(pageCount > 1 ? `${title || 'Untitled'} (page ${pageNumber})` : title, styleHref), topBarHtml(crumbs, title)];
    parts.push('<div class="bsafes-pagePanel"><div class="row justify-content-center"><div class="col-sm-10 col-12">');
    parts.push(`<h2 class="pt-4">${escapeHtml(title || 'Untitled')}</h2>`);
    if (subtitle) parts.push(`<p class="text-muted"><small>${escapeHtml(subtitle)}</small></p>`);
    parts.push('<hr>');
    if (!items.length) {
        parts.push('<p class="bsafes-panelNote">This is empty.</p>');
    } else {
        parts.push('<div class="list-group list-group-flush bsafes-contents">');
        items.forEach(({ title: itemTitle, typeLabel, href }) => {
            const icon = TYPE_ICONS[typeLabel] || 'fa-file-o';
            parts.push(`<a class="list-group-item list-group-item-action" href="${escapeHtml(href)}">`
                + `<i class="fa ${icon} bsafes-typeIcon" aria-hidden="true"></i>`
                + `<span>${escapeHtml(itemTitle || 'Untitled')}</span>`
                + `<span class="bsafes-typeLabel">${escapeHtml(typeLabel || '')}</span></a>`);
        });
        parts.push('</div>');
        if (pageCount > 1) {
            const first = (pageNumber - 1) * INDEX_ITEMS_PER_PAGE + 1;
            parts.push(`<p class="text-muted text-center mt-3 mb-0"><small>${first}–${first + items.length - 1} of ${totalItems}</small></p>`);
        }
        parts.push(paginationHtml(pageNumber, pageCount));
    }
    parts.push('</div></div></div>');
    parts.push('</body></html>');
    return parts.join('\n');
}

/** A row centered like the app's page: `col-sm-10 col-12` (or `colClass`) inside a centered row. */
const centeredRow = (innerHtml, colClass = 'col-sm-10 col-12') =>
    `<div class="row justify-content-center"><div class="${colClass}">${innerHtml}</div></div>`;

/** Read-only editor markup, as in components/editor.jsx. */
const editorHtml = (rowClass, innerHtml) =>
    `<div class="px-2"><div class="row m-0 ${rowClass} fr-element fr-view"><div class="inner-html">${innerHtml}</div></div></div>`;

function tagsRowHtml(tags) {
    if (!tags || !tags.length) return '';
    const tagSpans = tags.map((t) => `<span class="react-tagsinput-tag">${escapeHtml(t)}</span>`).join(' ');
    return '<div class="row bsafes-tagsRow">'
        + '<div class="col-2 bsafes-tagsIcon"><i class="fa fa-tags" aria-hidden="true"></i></div>'
        + `<div class="col-8"><div class="react-tagsinput"><span>${tagSpans}</span></div></div>`
        + '</div>';
}

const panelWordsHtml = (words) => (words ? `<div class="bsafes-panelWords">${editorHtml('', words)}</div>` : '');

/**
 * Builds the main part of a page (everything below the "back" links): tags, title, drawing,
 * text, then the videos, images, audio and attachments panels (in the app, these sit outside the
 * page text). The markup follows the app (components/pagePanel.jsx, itemTopRows.jsx,
 * pageCommons.jsx and the panel components). It doesn't depend on where the page is in the
 * export, so it can be stored once and reused when the page is moved.
 * Captions (`words`) are already cleaned HTML.
 */
export function buildPageBody({ titleHtml, titleText, tags, contentHtml, drawing = null, images = [], videos = [], audios = [], attachments = [] }) {
    const parts = [];
    parts.push(tagsRowHtml(tags));
    parts.push('<div class="pageCommons">');
    parts.push(centeredRow('<hr class="mx-3">', 'col-sm-10'));
    parts.push(centeredRow(editorHtml('bsafes-titleEditorRow', titleHtml || `<h2>${escapeHtml(titleText || '')}</h2>`)));
    parts.push(`<div class="row justify-content-center mx-2"><div class="col-sm-10"><hr></div></div>`);

    let contentInner = '';
    if (drawing) {
        if (drawing.imagePath) contentInner += `<img class="bsafes-drawing" src="${drawing.imagePath}" alt="Drawing">`;
        else if (drawing.failed) contentInner += '<p class="bsafes-panelNote">This drawing could not be included in the export.</p>';
        else if (drawing.empty) contentInner += '<p class="bsafes-panelNote">This drawing is empty.</p>';
    }
    if (contentHtml) contentInner += contentHtml;
    parts.push(`<div class="row justify-content-center"><div class="contentEditorRow col-sm-10 col-12" style="min-height:280px">${editorHtml('bsafes-editorRow', contentInner)}</div></div>`);
    parts.push('<br><br><hr class="my-2 mx-3">');

    parts.push('<div class="bsafes-pageCommonsExtension">');
    if (videos.length) {
        const panels = videos.map(({ path, fileName, words }) => '<div class="bsafes-videoPanel">'
            + `<h6><i class="fa fa-video-camera" aria-hidden="true"></i> <span class="attachmentFileName">${escapeHtml(fileName)}</span></h6>`
            + `<video class="w-100" controls playsinline src="${path}"></video>${panelWordsHtml(words)}</div>`);
        parts.push(centeredRow(panels.join('\n'), 'col-12 col-md-8'));
    }
    if (images.length) {
        const panels = images.map(({ path, words }) => `<div class="bsafes-imagePanel"><img class="img-fluid" src="${path}" alt="">${panelWordsHtml(words)}</div>`);
        parts.push(centeredRow(panels.join('\n'), 'col-12 col-sm-10 col-lg-8'));
    }
    if (audios.length) {
        const panels = audios.map(({ path, fileName, words }) => '<div class="bsafes-audioPanel">'
            + `<h6><i class="fa fa-volume-up" aria-hidden="true"></i> <span class="attachmentFileName">${escapeHtml(fileName)}</span></h6>`
            + `<audio class="w-100" controls src="${path}"></audio>${panelWordsHtml(words)}</div>`);
        parts.push(centeredRow(panels.join('\n'), 'col-12 col-md-8'));
    }
    if (attachments.length) {
        const panels = attachments.map(({ path, fileName, size }) => '<div class="card bsafes-attachmentPanel"><div class="card-body">'
            + `<h6><i class="fa fa-file-o" aria-hidden="true"></i> <a class="attachmentFileName" href="${path}" download>${escapeHtml(fileName)}</a></h6>`
            + (size != null ? `<p class="mb-0">${numberWithCommas(size)} bytes</p>` : '')
            + '</div></div>');
        parts.push(centeredRow(panels.join('\n'), 'col-12 col-md-8'));
    }
    parts.push('</div>');
    parts.push('</div>');
    return parts.join('\n');
}

/**
 * Turns a page body (from buildPageBody) into the full page.html file, adding the "back" links
 * for where the page sits in the export and the links to the style folder (`styleHref`).
 * It opens in any browser, without the app.
 */
export function wrapPageHtml(bodyHtml, { titleText, crumbs = [], styleHref }) {
    return [
        htmlHead(titleText, styleHref),
        topBarHtml(crumbs, titleText),
        `<div class="bsafes-pagePanel">${bodyHtml}</div>`,
        '</body></html>',
    ].join('\n');
}
