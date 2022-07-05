export function PostCall({ api, body }) {
    return new Promise((resolve, reject) => {
        const domain = 'https://la19lsux40.execute-api.us-east-1.amazonaws.com';
        const url = `${domain}/${api}`
        fetch(url, {
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST"
        })
        .then(res => res.json())
        .then(response => {
            resolve(response.data);
        })
        .catch(error =>{
            reject(error);
        })
    });
}