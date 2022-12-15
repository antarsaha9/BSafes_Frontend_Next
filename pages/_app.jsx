import SSRProvider from 'react-bootstrap/SSRProvider'
import store, {reduxWrapper} from '../reduxStore/store'
import '../styles/bootstrap.min.css'
import '../styles/react-tagsinput-bsafes.css'
import "../styles/react-datepicker-bsafes.css";
import "../styles/froala-editor-bsafes.css"

function MyApp({ Component, pageProps }) {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
    
  )
}

export default reduxWrapper.withRedux(MyApp);
