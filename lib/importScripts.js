export async function FroalaPlugins() {
    return Promise.all([
        import(/* webpackChunkName: 'FroalaPlugins' */'../public/js/froalaEditorJS/bsafesAPIHooks'),
        import(/* webpackChunkName: 'FroalaPlugins' */'../public/js/froalaEditorJS/froala_editor'),
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
        
        
        // import('froala-editor/css/froala_style.min.css'),
        // import('froala-editor/css/froala_editor.min.css'),
        // import('froala-editor/css/plugins/char_counter.min.css'),
        // import('froala-editor/css/plugins/code_view.min.css'),
        // import('froala-editor/css/plugins/colors.min.css'),
        // import('froala-editor/css/plugins/emoticons.min.css'),
        // import('froala-editor/css/plugins/file.min.css'),
        // import('froala-editor/css/plugins/fullscreen.min.css'),
        // import('froala-editor/css/plugins/image.min.css'),
        // import('froala-editor/css/plugins/image_manager.min.css'),
        // import('froala-editor/css/plugins/line_breaker.min.css'),
        // import('froala-editor/css/plugins/quick_insert.min.css'),
        // import('froala-editor/css/plugins/table.min.css'),
    ])
}

export function Codemirror() {
    import(/* webpackChunkName: 'CodeMirror' */'codemirror')
    import(/* webpackChunkName: 'CodeMirror' */'codemirror/mode/xml/xml')

    // import(/* webpackChunkName: 'CodeMirror' */'codemirror/lib/codemirror.css')
}
export function Photoswipe() {
    import(/* webpackChunkName: 'Photoswipe' */'photoswipe')
    import(/* webpackChunkName: 'Photoswipe' */'photoswipe/dist/photoswipe-ui-default')

    // import(/* webpackChunkName: 'Photoswipe' */'photoswipe/dist/default-skin/default-skin.css')
    // import(/* webpackChunkName: 'Photoswipe' */'photoswipe/dist/photoswipe.css')
}

export async function Others() {
    import(
        /* webpackChunkName: 'Others' */
        'streamsaver')
    // import(
    //     /* webpackIgnore: true */
    //     /* webpackChunkName: 'Others' */
    //     'https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.0.2/dist/ponyfill.min.js')
    // import(
    //     /* webpackIgnore: true */
    //     /* webpackChunkName: 'Others' */
    //     'https://cdn.jsdelivr.net/gh/eligrey/Blob.js/Blob.js')
    // import(
    //     /* webpackIgnore: true */
    //     /* webpackChunkName: 'Others' */
    //     'https://cdn.jsdelivr.net/npm/streamsaver@2.0.3/StreamSaver.min.js')

}