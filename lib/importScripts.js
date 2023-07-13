const apiHooks = import(/* webpackChunkName: 'FroalaPlugins' */'../public/js/froalaEditorJS/bsafesAPIHooks');
apiHooks.then((module) => {
    // exposing the functions to window, because webpack will uglify them.
    for (const f in module) {
        window[f] = module[f];
    }
})
export const Froala = Promise.all([
    apiHooks,
    import(/* webpackChunkName: 'FroalaPlugins' */'../public/js/froalaEditorJS/froala_editor'),
]);
export const FroalaPlugins = Promise.all([
    import(/* webpackChunkName: 'FroalaPlugins' */'../public/js/froalaEditorJS/froalaEncryptImage'),
    import(/* webpackChunkName: 'FroalaPlugins' */'../public/js/froalaEditorJS/froalaEncryptVideo'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/align.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/char_counter.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/code_beautifier.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/code_view.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/colors.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/emoticons.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/entities.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/font_family.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/font_size.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/inline_style.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/line_breaker.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/link.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/lists.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/paragraph_format.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/paragraph_style.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/quick_insert.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/quote.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/save.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/table.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor/js/plugins/url.min.js'),
    import(/* webpackChunkName: 'FroalaPlugins' */'froala-editor2.9.8/js/plugins/line_height.min.js'),
]);

export const Codemirror = Promise.all([
    import(/* webpackChunkName: 'CodeMirror' */'codemirror'),
    import(/* webpackChunkName: 'CodeMirror' */'codemirror/mode/xml/xml'),
]);

export const Photoswipe = Promise.all([
    import(/* webpackChunkName: 'Photoswipe' */'photoswipe'),
    import(/* webpackChunkName: 'Photoswipe' */'photoswipe/dist/photoswipe-ui-default'),
]);
