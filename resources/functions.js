const { Collection } = require("discord.js");
const axios = require("axios").default;
const ping = require('mcpe-ping');
const ms = require("ms");

const cooldownCache = new Collection();
function checkCooldown(command, id, cooldown, isButton) {
    const name = isButton ? command + '-b' : command + '-c'

    let userCache = cooldownCache.get(id);
    if (userCache) {
        const ends = userCache.get(name);
        if (ends) {
            if (ends > Date.now()) {
                let string;
                command = command.charAt(0).toUpperCase() + command.slice(1);
                (isButton) ? string = `the **${command}** button` : string = `**/${command}**`;
                let expires = ends - Date.now();
                return { cooldown: true, message: `You can use ${string} again in \`${ms(expires < 1000 ? 1000 : expires, { long: true })}\`!` };
            } else {
                userCache.delete(name);
                userCache.set(name, Date.now() + (cooldown * 1000));
                return { cooldown: false };
            }
        } else {
            userCache.set(name, Date.now() + (cooldown * 1000));
            return { cooldown: false };
        }
    } else {
        cooldownCache.set(id, new Collection());
        userCache = cooldownCache.get(id);
        userCache.set(name, Date.now() + (cooldown * 1000));
        return { cooldown: false };
    }
};

async function query(server = 'hub') {
    if (!process.env[server]) return console.trace(`Server '${server}' not found.`);
    server = process.env[server].split(':'), start = Date.now();

    return new Promise((resolve, reject) => {
        ping(server[0], parseInt(server[1]), function (error, response) {
            if (error) return reject(error)
            response.ping = Date.now() - start;
            resolve(response);
        }, true, 4000);
        setTimeout(() => { reject('offline') }, 1000)
    });
}

function colorify(string, color = 'green') {
    switch (color) {
        case 'pass':
            color = 90;
            break;
        case 'fail':
            color = 31;
            break;
        case 'bright pass':
            color = 92;
            break;
        case 'bright fail':
            color = 91;
            break;
        case 'bright yellow':
            color = 93;
            break;
        case 'aqua':
            color = 36
            break;
        default:
            color = 32;
    }
    return `\u001b[${color}m${string}\u001b[0m`;
};

module.exports = {
    checkCooldown,
    colorify,
    query
};