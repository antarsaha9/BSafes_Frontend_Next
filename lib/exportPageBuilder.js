function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}

function wrapWithCaption(el, words) {
    if (!words) return el;
    const figure = document.createElement('figure');
    figure.appendChild(el);
    const figcaption = document.createElement('figcaption');
    figcaption.innerHTML = words;
    figure.appendChild(figcaption);
    return figure;
}

/**
 * Rewrites the inline `.bSafesImage`/`.bSafesDownloadVideo` placeholder elements found in
 * decrypted page content into real, browser-viewable `<img>`/`<video>` tags pointing at the
 * exported media files, wrapping each in a `<figure>` with its caption when one exists.
 *
 * `imageInfoByS3Key`/`videoInfoByS3KeyPrefix` are `{ [key]: { path, words } }` maps built
 * from the already-downloaded imagePanels/videoPanels for this item.
 */
export function rewriteInlineMedia(contentHtml, imageInfoByS3Key, videoInfoByS3KeyPrefix) {
    if (!contentHtml) return '';
    const container = document.createElement('div');
    container.innerHTML = contentHtml;

    container.querySelectorAll('.bSafesImage').forEach((img) => {
        const idParts = (img.id || '').split('&');
        const s3Key = idParts[0];
        const info = imageInfoByS3Key[s3Key];
        img.removeAttribute('id');
        if (info) {
            img.setAttribute('src', info.path);
            img.replaceWith(wrapWithCaption(img, info.words));
        } else {
            img.setAttribute('alt', 'Image unavailable');
        }
    });

    container.querySelectorAll('.bSafesDownloadVideo').forEach((el) => {
        const idParts = (el.id || '').split('&');
        const s3KeyPrefix = idParts[0] === 'chunks' ? idParts[3] : null;
        const info = s3KeyPrefix ? videoInfoByS3KeyPrefix[s3KeyPrefix] : null;
        const videoEl = document.createElement('video');
        videoEl.setAttribute('controls', '');
        if (info) videoEl.setAttribute('src', info.path);
        el.replaceWith(wrapWithCaption(videoEl, info && info.words));
    });

    return container.innerHTML;
}

/**
 * Assembles a standalone, self-contained HTML document for one exported page - openable
 * directly in any browser/Finder/Explorer preview, independent of the BSafes app.
 */
export function buildPageHtml({ titleHtml, titleText, tags, contentHtml, drawingImagePath, audios = [], attachments = [] }) {
    const parts = [];
    parts.push('<!DOCTYPE html>');
    parts.push('<html><head><meta charset="utf-8">');
    parts.push(`<title>${escapeHtml(titleText || 'Untitled')}</title>`);
    parts.push('</head><body>');
    parts.push(titleHtml || `<h2>${escapeHtml(titleText || '')}</h2>`);
    if (tags && tags.length) {
        parts.push('<p class="bsafes-tags">' + tags.map((t) => `<span class="bsafes-tag">${escapeHtml(t)}</span></br>`).join(' ') + '</p>');
    }
    if (drawingImagePath) {
        parts.push(`<img src="${drawingImagePath}" alt="Drawing">`);
    }
    if (contentHtml) {
        parts.push(`<div class="bsafes-content">${contentHtml}</div>`);
    }
    if (audios.length) {
        parts.push('<h3>Audio</h3>');
        audios.forEach(({ path, fileName, words }) => {
            parts.push(`<div><audio controls src="${path}"></audio> ${escapeHtml(fileName)}</div>`);
            if (words) parts.push(`<div class="bsafes-caption">${words}</div>`);
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
