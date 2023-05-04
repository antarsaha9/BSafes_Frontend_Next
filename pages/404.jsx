import Router from "next/router";
import { useEffect, useState } from "react";
const pathRegex = /^\/((?:activities|box(?:\/contents)?|diary(?:\/(?:contents|p))?|folder(?:\/(?:contents|p))?|notebook(?:\/(?:contents|p))?|page|tagsInput|team(?:Members)?|trashBox)\/([^\/]+))|(log(?:In|Out)|buyQuotas|keySetup|plans|safe|teams)$/

export default function Custom404() {
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (pathRegex.test(window.location.pathname)) {
      Router.replace(window.location.pathname); // Redirect to the right page...
    } else {
      setIsNotFound(true);
    }
  }, []);

  if (isNotFound) return <h1>404 - Page Not Found</h1>;

  return null;
}