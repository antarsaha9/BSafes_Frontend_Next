import { resizeImageFile } from "./wnImage";
import { getDataURLFromFile } from "./helper";
import forge from 'node-forge';

export const TWIN_PAPER_ELEMENT_HEIGHT = 660;
export const twinPaperTemplate = {
    "type": "excalidraw",
    "version": 2,
    "source": "https://www.bsafes.com",
    "elements": [
        {
            "id": "kgc_8FlwCb1DcAHHt8KJA",
            "type": "image",
            "x": -227.20407104492188,
            "y": -317.23540242513013,
            "width": 495.64208984375006,
            "height": 660.8561197916666,
            "angle": 0,
            "strokeColor": "transparent",
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100,
            "groupIds": [],
            "frameId": null,
            "index": "a0",
            "roundness": null,
            "seed": 1286616356,
            "version": 114,
            "versionNonce": 320554599,
            "isDeleted": false,
            "boundElements": [],
            "updated": 1786002424727,
            "link": null,
            "locked": false,
            "status": "pending",
            "fileId": "9f944e27b5f694afc33a90856fafd632b8143cd8",
            "scale": [
                1,
                1
            ],
            "crop": null
        }
    ],
    "appState": {
        "forBSafes": false,
        "forBSafesImageMaxWidthOrHeight": 1440,
        "gridSize": 20,
        "gridStep": 5,
        "gridModeEnabled": false,
        "viewBackgroundColor": "#ffffff"
    },
    "files": {
    }
}
export const prepareTwinPaperDraft = (file) => {
    return new Promise(async (resolve, reject) => {
        try {
            const imageFile = await resizeImageFile(file);
            const dataURL = await getDataURLFromFile(imageFile);
            const imgElement = document.createElement('img');
            imgElement.src = dataURL;
            imgElement.onload = function () {
                const originalWidth = imgElement.naturalWidth;
                const originalHeight = imgElement.naturalHeight;
                const elementHeight = TWIN_PAPER_ELEMENT_HEIGHT;
                const elementWidth = originalWidth * (elementHeight / originalHeight);
                const drawingContent = twinPaperTemplate;
                drawingContent.elements[0].width = elementWidth;
                drawingContent.elements[0].height = elementHeight;
                const fileId = `twin_${Date.now()}`;
                drawingContent.elements[0].fileId = fileId;
                const imageFileData = {
                    "mimeType": dataURL.split(";")[0].split(":")[1],
                    "id": fileId,
                    "dataURL": dataURL,
                    "created": Date.now(),
                    "lastRetrieved": Date.now()
                }
                drawingContent.files[fileId] = imageFileData;
                const contentSample = ({
                    metadata: {
                        ExcalidrawSerializedJSON: JSON.stringify(drawingContent),
                    }
                });
                const draft = forge.util.encodeUtf8(JSON.stringify(contentSample));
                resolve({status:"ok", draft});
            };
        } catch (error) {
            console.error(
                "Error preparing twin paper draft with image file",
                error,
            );
            resolve({status:"error", error});
        }
    });
}