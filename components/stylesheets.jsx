import {useState} from 'react'

var count = 0;
export default function Stylesheets() {
 

    console.log("Render count:", count);
    count ++;
    
    return (
        <div> 
			{/*
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/froala_editor.min.css?v0.OB1.20211130" integrity="sha384-jvHCuNtfPGLMsiP4SDWWcKNJvBI59kcFwyLJhBVj7viDth7i3WwHaZbn2bfeyuSZ" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/froala_style.min.css?v0.OB1.20211130" integrity="sha384-PWPEGQLOmmckdheKfP2+eOpLg5UTWQOqVJYUmOxAFnjkcpQfgIDkU1Ir4yNEJbD4" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.css?v0.OB1.20211130" integrity="sha384-MZMLOApFPOp4PDt68rRItRjUt8HV1KESwknCtzaLFttyUc4O0Vm61LznNr9glcfE" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/char_counter.min.css?v0.OB1.20211130" integrity="sha384-pXH9UmzpfsmuIXWoCfNSp81pbpHEXKOSbQ2HlYbfuyojpmeU+RWyYQqgC7G1n31w" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/code_view.min.css?v0.OB1.20211130" integrity="sha384-0oN0Nwx7dBaL1/ZW/mT4UGARvHqZCekcFXVk9RspUPkh9iu6skXv5mt/ivW17sZX" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/colors.min.css?v0.OB1.20211130" integrity="sha384-SW2hj/plPFYuJSnz2wAOKXllojZ9jYYijJ7hSAjXytie+HI+VURobzL9IQGyUhC2" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/emoticons.min.css?v0.OB1.20211130" integrity="sha384-RYufO3r3eh3x4GXUUfEvCQZbd+QB/92/WPRlTlr2iQKk2t5tc1ixYR8iYX2aT3iZ" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/file.min.css?v0.OB1.20211130" integrity="sha384-kTFz9NJvwvDj5QRPevteCOOxlwjpkEjRHZKrmYWgs1RB8qr3VFWy52E4bEcZu2VF" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/fullscreen.min.css?v0.OB1.20211130" integrity="sha384-3iLNzK6PmFqdk+KevPzvnrthZKyJDWvgVb/CIJ/oW9rFVhr8CtThzdKCJxv+mGh3" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/image.min.css?v0.OB1.20211130" integrity="sha384-4UGtVxZ3hONszwML2at+09SAqPk81zJvSuFlxUQesNOtre0Oen1x7/d6X5wV4rAE" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/image_manager.min.css?v0.OB1.20211130" integrity="sha384-SBPToF84eT2Gpo5MfBbWAeFAfhGx/QUquSnU4Kt8zk/R4l4OMi6dJxRJjUb25YZf" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/line_breaker.min.css?v0.OB1.20211130" integrity="sha384-D8J0J9BDQDJZVMRnPv7mPcf3a10Lna3LIW9ectwVSp16upwpXa2FuKY5FKYFEOBd" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/quick_insert.min.css?v0.OB1.20211130" integrity="sha384-hIpOJCEpNcF9z9SBTc4LzPC6uxLaSc97x5PUzgQna1bAQHsYlO6Tp9z0grDZECWD" crossOrigin="anonymous" />
		        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/table.min.css?v0.OB1.20211130" integrity="sha384-Q3HbN07q2FZogwHXFAydCAVta/dmUDXVBV3mQPgbBH2joTjueoSlbZUcFh18njuN" crossOrigin="anonymous" />      
				<link rel="stylesheet" href="/css/froalaEditorCSS/video.css?v0.OB1.20211130" crossOrigin="anonymous"></link>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.css?v0.OB1.20211130" integrity="sha384-h/L2W9KefUClHWaty3SLE5F/qvc4djlyR4qY3NUV5HGQBBW7stbcfff1+I/vmsHh" crossOrigin="anonymous" />
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/default-skin/default-skin.min.css?v0.OB1.20211130" integrity="sha384-iD0dNku6PYSIQLyfTOpB06F2KCZJAKLOThS5HRe8b3ibhdEQ6eKsFf/EeFxdOt5R" crossOrigin="anonymous" />
			*/}
		</div> 
    )
}