import { useEffect } from "react";
import { useRouter } from "next/router";

import { products } from "../../lib/productID";
import { debugLog } from "../../lib/helper";

export default function PRODUCT() {
    const debugOn = true;
    
    const router = useRouter();
    const productID = router.query.productID;

    useEffect(()=> {
        debugLog(debugOn, `ProductID: ${productID}`);
        let productLink = products[productID];
        if( productLink){
            router.push(productLink)
        }
    }, [productID])

    return (
        <></>
    )
}