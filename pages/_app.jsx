import { useEffect } from 'react';
import SSRProvider from 'react-bootstrap/SSRProvider'
import {reduxWrapper} from '../reduxStore/store'

import '../styles/materia.css'
import '../styles/bootstrapOverride.css'
import '../styles/react-tagsinput-bsafes.css'
import "../styles/react-datepicker-bsafes.css";
import "../styles/froala-editor-bsafes.css"
import '../lib/importStyles';
import '../public/css/froalaEditorCSS/video.css'


function MyApp({ Component, pageProps }) {
  useEffect(()=> {
    if("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/serviceWorkerV192.js?v192", {
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
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
    
  )
}

export default reduxWrapper.withRedux(MyApp);
