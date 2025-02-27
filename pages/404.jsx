import Router from "next/router";
import { useEffect, useState } from "react";
import { products } from "../lib/productID";

const pathRegex = /^\/((?:activities|box(?:\/contents)?|diary(?:\/(?:contents|p))?|folder(?:\/(?:contents|p))?|notebook(?:\/(?:contents|p))?|n|public|services|apps|page|tagsInput|team(?:Members)?|trashBox)\/([^\/]+))|(log(?:In|Out)|buyQuotas|keySetup|payment|safe|teams|v1\/keyEnter|v1\/extraMFA)$/

export default function Custom404() {
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    console.log("404: ", window.location.pathname + window.location.search)
    let redirect = false;
    if (pathRegex.test(window.location.pathname)) {
      redirect = true;
    } else if (window.location.pathname.startsWith('/pd/')) {
      redirect = true;
    } else {
      let productID = window.location.pathname.split('/')[1];
      console.log(`productID: ${productID}`)
      if(productID && products[productID]){
        redirect = true;
      }
    }
    if(redirect) {
      console.log("redirect => ", window.location.pathname + window.location.search);
      Router.replace(window.location.pathname + window.location.search); // Redirect to the right page...
    } else {
      setIsNotFound(true);
    }
  }, []);

  if (isNotFound) return <h1>404 - Page Not Found</h1>;

  return null;
}