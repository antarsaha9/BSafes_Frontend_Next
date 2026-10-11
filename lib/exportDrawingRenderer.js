import { convertUint8ArrayToBinaryString } from './helper';

/**
 * Turns a saved drawing into a PNG picture.
 * The app doesn't save drawings as pictures (it draws them each time),
 * so the backup draws one here, with the same settings the app uses.
 * Returns the picture, or null if the drawing is empty.
 * Note: custom fonts aren't loaded here, so text in a drawing may use the default font.
 */
export async function renderDrawingToPng(sceneJSON) {
    const Excalidraw = await import(/* webpackChunkName: 'Excalidraw' */'@excalidraw/excalidraw');
    const restored = Excalidraw.restore(JSON.parse(sceneJSON));
    const elements = (restored.elements || []).filter((element) => !element.isDeleted);
    if (!elements.length) return null;

    const canvas = await Excalidraw.exportToCanvas({
        elements,
        appState: {
            ...restored.appState,
            exportWithDarkMode: false,
            exportBackground: true,
            exportScale: 2,
        },
        files: restored.files || {},
        maxWidthOrHeight: 2048,
    });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    return convertUint8ArrayToBinaryString(new Uint8Array(await blob.arrayBuffer()));
}
