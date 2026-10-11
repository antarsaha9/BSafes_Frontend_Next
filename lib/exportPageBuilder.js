function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

/**
 * In the app, images and videos inside page text are placeholders that the app fills in later.
 * This turns them into normal images and video players that point to the saved files,
 * so the page shows them when opened in any browser.
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

    container.querySelectorAll('.bSafesDownloadVideo').forEach((el) => {
        const media = mediaByElementId[el.id];
        const videoEl = document.createElement('video');
        videoEl.setAttribute('controls', '');
        videoEl.style.maxWidth = '100%';
        if (media) videoEl.setAttribute('src', media.path);
        el.replaceWith(videoEl);
    });

    return container.innerHTML;
}

/**
 * Builds the page.html file for one page. It can be opened in any browser, without the BSafes app.
 * It shows the title, tags, text and drawing, followed by sections for gallery images,
 * videos, audio and attachments (in the app, these sit outside the page text).
 * Captions (`words`) are already cleaned HTML, so they are added as they are.
 */
export function buildPageHtml({ titleHtml, titleText, tags, contentHtml, drawing = null, images = [], videos = [], audios = [], attachments = [] }) {
    const parts = [];
    parts.push('<!DOCTYPE html>');
    parts.push('<html><head><meta charset="utf-8">');
    parts.push(`<title>${escapeHtml(titleText || 'Untitled')}</title>`);
    parts.push('<style>img,video{max-width:100%;height:auto} figure{margin:1em 0} .bsafes-tag{background:#eee;border-radius:4px;padding:2px 6px;margin-right:4px}</style>');
    parts.push('</head><body>');
    parts.push(titleHtml || `<h2>${escapeHtml(titleText || '')}</h2>`);
    if (tags && tags.length) {
        parts.push('<p class="bsafes-tags">' + tags.map((t) => `<span class="bsafes-tag">${escapeHtml(t)}</span>`).join(' ') + '</p>');
    }
    if (drawing) {
        if (drawing.imagePath) parts.push(`<img src="${drawing.imagePath}" alt="Drawing">`);
        else if (drawing.failed) parts.push('<p><em>This drawing could not be included in the backup.</em></p>');
        else if (drawing.empty) parts.push('<p><em>This drawing is empty.</em></p>');
    }
    if (contentHtml) {
        parts.push(`<div class="bsafes-content">${contentHtml}</div>`);
    }
    if (images.length) {
        parts.push('<h3>Images</h3>');
        images.forEach(({ path, words }) => {
            parts.push(`<figure><img src="${path}" alt="">${words ? `<figcaption>${words}</figcaption>` : ''}</figure>`);
        });
    }
    if (videos.length) {
        parts.push('<h3>Videos</h3>');
        videos.forEach(({ path, fileName, words }) => {
            parts.push(`<figure><video controls src="${path}"></video><figcaption>${escapeHtml(fileName)}${words ? `<div>${words}</div>` : ''}</figcaption></figure>`);
        });
    }
    if (audios.length) {
        parts.push('<h3>Audio</h3>');
        audios.forEach(({ path, fileName, words }) => {
            parts.push(`<figure><audio controls src="${path}"></audio><figcaption>${escapeHtml(fileName)}${words ? `<div>${words}</div>` : ''}</figcaption></figure>`);
        });
    }
    if (attachments.length) {
        parts.push('<h3>Attachments</h3><ul>');
        attachments.forEach(({ path, fileName }) => {
            parts.push(`<li><a href="${path}">${escapeHtml(fileName)}</a></li>`);
        });
        parts.push('</ul>');
    }
    parts.push('</body></html>');
    return parts.join('\n');
}
