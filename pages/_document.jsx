import {Html, Head, Main, NextScript} from 'next/document'
import Stylesheets from '../components/stylesheets';

const Document = () => {
    return (
        <Html>
            <Head>
                {/* <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap" rel="stylesheet" /> */}
				{/* <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=La+Belle+Aurore&display=swap" rel="stylesheet" /> */}
				{/* <link href='https://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,700,700italic&subset=latin,vietnamese,latin-ext,cyrillic,cyrillic-ext,greek-ext,greek&display=swap' rel='stylesheet' /> */}
				{/* <link href='https://fonts.googleapis.com/css?family=Oswald:400,300,700&subset=latin,latin-ext&display=swap' rel='stylesheet' /> */}
				{/* <link href='https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap' rel='stylesheet' /> */}
				{/* <link href='https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300,300italic,700&subset=latin,greek,greek-ext,vietnamese,cyrillic-ext,cyrillic,latin-ext&display=swap' rel='stylesheet' /> */}
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