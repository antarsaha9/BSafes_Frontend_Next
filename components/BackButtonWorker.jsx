import { useRouter } from "next/router";
import { useEffect } from "react";
import { getFirstPageAfterLoggedIn } from "../lib/productID";
import { useSelector } from "react-redux";

export default function BackButtonWorker() {
    const isProduct = process.env.NEXT_PUBLIC_product;
    const isAndroid = process.env.NEXT_PUBLIC_platform === 'android';
    const router = useRouter();
    const memberId = useSelector(state => state.auth.memberId);
    const firstPage = getFirstPageAfterLoggedIn(memberId);

    const askToClose = () => {
        if (window.confirm("Are you sure to close?")) {
            window.Android.closeApp();
        }
        else {

        }
    }

    useEffect(() => {
        console.log("Back button rendered");

        if (isAndroid && isProduct) {
            if (window.bsafesAndroid)
                window.bsafesAndroid.onBackButtonPressed = () => {
                    if (router.asPath === firstPage)
                        askToClose();
                    else {
                        router.back();
                    }

                }
        };
    }, [router.asPath, firstPage,]);
}