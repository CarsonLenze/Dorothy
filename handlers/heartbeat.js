const axios = require('axios');

module.exports = async () => {
    await axios.post(process.env.HEARTBEAT).catch(() => { /* ERR */ });
    setInterval(async () => {
        await axios.post(process.env.HEARTBEAT).catch(() => { /* ERR */ });
    }, 60000 * 5);
};