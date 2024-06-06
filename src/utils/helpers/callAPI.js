import config from "../../config/config";

const callAPI = async (param) => {
    const { data, path, method } = param;

    const API_URL = `${config.API_URL}${path}`;
    const options = {
        method,
        headers: { 
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    }
    
    try {
        const res = await fetch(API_URL, options);
        const doc = await res.json();
        console.log(doc);
    } catch(err) {
        console.log(err);
    }
}

export default callAPI;