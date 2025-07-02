const API_BASE_URL = window.location.origin + '/api';

async function postData(endpoint, data) {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('📡 POST Error:', error);
        return { success: false, message: 'नेटवर्क त्रुटी' };
    }
}

async function getData(endpoint) {
    try {
        const response = await fetch(API_BASE_URL + endpoint);
        return await response.json();
    } catch (error) {
        console.error('📡 GET Error:', error);
        return { success: false, message: 'नेटवर्क त्रुटी' };
    }
}