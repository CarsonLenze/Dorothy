const { Collection } = require("discord.js");
const axios = require("axios").default;
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

async function player(gamerTag) {
    const params = `client_id=${process.env.XBOX_ID}&client_secret=${process.env.XBOX_SECRET}&refresh_token=${process.env.XBOX_TOKEN}&grant_type=refresh_token`;

    let accessToken = await axios.post('https://login.live.com/oauth20_token.srf', params);
    accessToken = accessToken.data.access_token;

    const authenticate = await axios.post('https://user.auth.xboxlive.com/user/authenticate', {
        'RelyingParty': 'http://auth.xboxlive.com',
        'TokenType': 'JWT',
        'Properties': {
            'AuthMethod': 'RPS',
            'SiteName': 'user.auth.xboxlive.com',
            'RpsTicket': `d=${accessToken}`
        }
    });
    const hash = authenticate.data.Token;

    let authorize = await axios.post('https://xsts.auth.xboxlive.com/xsts/authorize', {
        'RelyingParty': 'http://xboxlive.com',
        'TokenType': 'JWT',
        'Properties': {
            'SandboxId': 'RETAIL',
            'UserTokens': [hash]
        }
    });
    const uhs = authorize.data.DisplayClaims.xui[0].uhs,
        Token = authorize.data.Token;

    const query = await axios.get(`https://profile.xboxlive.com/users/gt(${gamerTag})/profile/settings?settings=GameDisplayPicRaw,Gamertag`, {
        headers: {
            'Authorization': `XBL3.0 x=${uhs};${Token}`,
            'x-xbl-contract-version': 3
        }
    }).catch(() => { /* ERR */ });
    const settings = query?.data?.profileUsers[0];

    if (!settings) return undefined;
    return { id: settings.id, icon: settings.settings[0].value, tag: settings.settings[1].value };
};

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
    player
};