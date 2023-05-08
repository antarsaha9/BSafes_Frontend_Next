import SSRProvider from 'react-bootstrap/SSRProvider'
import store, {reduxWrapper} from '../reduxStore/store'
import '../styles/bootstrap.min.css'
import '../styles/react-tagsinput-bsafes.css'
import "../styles/react-datepicker-bsafes.css";
import "../styles/froala-editor-bsafes.css"
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(()=> {
    if("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/downloadFile/serviceWorker.js?v4").then(
          function(registration) {
            console.log("Service worker registration successful with scope: ", registration.scope);
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
