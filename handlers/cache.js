const { colorify } = require("../resources/functions.js");
const { writeFileSync } = require("fs");
const mysql = require('mysql');
const util = require('util');

module.exports = async () => {
    const dorothy = mysql.createConnection(`${process.env.MYSQL_URI}/Dorothy`);
    dorothy.query = util.promisify(dorothy.query).bind(dorothy);
    let data = await dorothy.query(`SELECT * FROM Blacklists`);
    if (!data) data = [];

    writeFileSync("resources/cache.json", JSON.stringify({ blacklists: data }, 0, 4));
    console.log(`${colorify('INFO', 'bright yellow')} | Cached blacklists (cache.js)`);
    dorothy.end();
};