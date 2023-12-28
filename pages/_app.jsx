import { useEffect } from 'react';
import {reduxWrapper} from '../reduxStore/store'
import Head from "next/head";

import '../styles/materia.css'
import '../styles/react-tagsinput-bsafes.css'
import "../styles/react-datepicker-bsafes.css";
import "../styles/froala-editor-bsafes.css"
import '../lib/importStyles';
import '../public/css/froalaEditorCSS/video.css'
import '../styles/bootstrapOverride.css'


function MyApp({ Component, pageProps }) {
  useEffect(()=> {
    if("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/serviceWorkerV193.js?v196", {
        scope: "/",
      }).then(
          function(registration) {
            console.log("Service worker registration successful with scope: ", registration.scope);
              //registration.active.postMessage(
              //  "Test message sent immediately after creation"
              //);
          },
          function(err) {
            console.log("Service worker registration failed: ", err)
          }
      )  
    }
  }, [])
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <Component {...pageProps} />
    </>
    
  )
}

export default reduxWrapper.withRedux(MyApp);
