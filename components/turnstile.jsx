import Script from "next/script"
export default function Turnstile({ }) {
    const onLoad = () => {
        turnstile.render('#turnstileWidget', {
            sitekey: '0x4AAAAAAAgVmy_Jh_y_Psw2',
            callback: function(token) {
                console.log(`Challenge Success ${token}`);
            },
            "error-callback": function(e) {
                console.log(e);
            }
        });
    }
    return (
        <>
            <div id="turnstileWidget"></div>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                onLoad={onLoad}
                onError={(e) => onError('load error: ' + e.message)}
            />
        </>
    )
}