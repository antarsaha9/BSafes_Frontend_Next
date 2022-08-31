import SSRProvider from 'react-bootstrap/SSRProvider'
import store, {reduxWrapper} from '../reduxStore/store'
import '../styles/bootstrap.min.css'
import '../styles/react-tagsinput.css'

function MyApp({ Component, pageProps }) {
  return (
    <SSRProvider>
      <Component {...pageProps} />
    </SSRProvider>
    
  )
}

export default reduxWrapper.withRedux(MyApp);
