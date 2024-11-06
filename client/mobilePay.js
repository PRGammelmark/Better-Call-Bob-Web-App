import axios from "axios";

console.log(import.meta.env.VITE_API_URL)

console.log(process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY)
axios.post('https://apitest.vipps.no/accesstoken/get', {}, {
    headers: {
        'Content-Type': 'application/json',
        'client_id': `${process.env.VITE_MP_CLIENT_ID}`,
        'client_secret': `${process.env.VITE_MP_CLIENT_SECRET}`,
        'Ocp-Apim-Subscription-Key': `${process.env.VITE_OCP_APIM_SUBSCRIPTION_KEY_PRIMARY}`,
        'Merchant-Serial-Number': `${process.env.VITE_MSN}`,
        'Vipps-System-Name': 'YOUR-SYSTEM-NAME',
        'Vipps-System-Version': 'YOUR-SYSTEM-VERSION',
        'Vipps-System-Plugin-Name': 'YOUR-PLUGIN-NAME',
        'Vipps-System-Plugin-Version': 'YOUR-PLUGIN-VERSION'
    }
})
.then(response => {
    console.log('Access token received:', response.data);
})
.catch(error => {
    console.error('Error fetching access token:', error);
});
