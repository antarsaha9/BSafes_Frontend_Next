const bsafesNative = import('../public/js/bsafesNative');
bsafesNative.then((module) => {
    // exposing the functions to window, because webpack will uglify them.
    for (const f in module) {
        window[f] = module[f];
    }
})
export const commonScripts = Promise.all([
    bsafesNative
]);