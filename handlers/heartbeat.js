const axios = require('axios');

module.exports = async () => {
    await axios.post(process.env.HEARTBEAT);
    setInterval(async () => {
        await axios.post(process.env.HEARTBEAT);
    }, 60000 * 5);
};