import { useEffect } from 'react';
import { reduxWrapper } from '../reduxStore/store'
import { useDispatch } from 'react-redux';
import Head from "next/head";
import Script from 'next/script';

import '../styles/materia.css'
import '../styles/react-tagsinput-bsafes.css'
import "../styles/react-datepicker-bsafes.css";
import '../lib/importStyles';
import '../lib/importFonts';
import "../styles/froala-editor-bsafes.css"
import '../public/css/froalaEditorCSS/video.css'
import '../styles/bootstrapOverride.css'
import '../styles/complianceBadge.css'

import { accountActivity } from '../lib/activities';
import { debugLog } from '../lib/helper';
import { activityDone } from '../reduxStore/accountSlice';

function MyApp({ Component, pageProps }) {
  const debugOn = true;
  const dispatch = useDispatch()
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_platform === 'iOS') {
      const pingFromNative = () => {
        debugLog(debugOn, "pingFromNative");
        return "ok"
      }
      window.bsafesNative = {
        name: "bsafeNative",
        pingFromNative
      }
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./serviceWorkerV210.js?v210", { //
        scope: "/",
      }).then(
        function (registration) {
          console.log("Service worker registration successful with scope: ", registration.scope);
          //registration.active.postMessage(
          //  "Test message sent immediately after creation"
          //);
        },
        function (err) {
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
        <link rel='icon' href='/favicon.png' />
      </Head>
      <Component {...pageProps} />
      <Script
        strategy="beforeInteractive"
        src="/js/globalThis_0.4.4_min.js"
      ></Script>
    </>

  )
}

export default reduxWrapper.withRedux(MyApp);
