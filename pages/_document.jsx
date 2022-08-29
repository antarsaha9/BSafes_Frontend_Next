import {Html, Head, Main, NextScript} from 'next/document'
import Stylesheets from '../components/stylesheets';

const Document = () => {
    return (
        <Html>
            <Head>
                <Stylesheets />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

export default Document;