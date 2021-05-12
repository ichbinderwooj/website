/*
 * This is a module for easier Discord message sending because
 * discord.js doesn't work the way I want it to and sending 
 * messages is pretty much the only thing I need to do with 
 * Discord.
 */

const http = require("https");
const config = require("../config.json");

function sendMsg(channelID, message) {
    let data = JSON.stringify({
        content: message,
        tts: false
    });
    let options = {
        hostname: 'discord.com',
        path: `/api/v8/channels/${channelID}/messages`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "Authorization": `Bot ${config.discord.token}`
        }
    }
    let req = http.request(options);
    req.on("error", function (error) {
        if (error) return false;
    });
    req.write(data);
    req.end();
    return true;
}

function sendEmbed(channelID, embed) {
    let data = JSON.stringify({
        embed: embed,
        tts: false
    });
    let options = {
        hostname: 'discord.com',
        path: `/api/v8/channels/${channelID}/messages`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "Authorization": `Bot ${config.discord.token}`
        }
    }
    let req = http.request(options);
    req.on("error", function (error) {
        return false;
    });
    req.write(data);
    req.end();
    return true;
}

module.exports.sendMsg = sendMsg

module.exports.sendEmbed = sendEmbed

module.exports.logSucc = function (title, description, fields) {
    sendEmbed("836924968871657502", {
        title: title,
        description: description,
        color: 0x00ff00,
        fields: fields
    });
}

module.exports.logErr = function (err) {
    sendEmbed("836924968871657502", {
        title: err.name,
        description: err.message,
        color: 0xff0000,
        fields: [{
            name: "At:",
            value: err.stack,
            inline: false
        }]
    });
}

module.exports.logInfo = function (title, description, fields) {
    sendEmbed("836924968871657502", {
        title: title,
        description: description,
        color: 0x00ffff,
        fields: fields
    });
}

module.exports.logWarn = function (title, description, fields) {
    sendEmbed("836924968871657502", {
        title: title,
        description: description,
        color: 0xffff00,
        fields: fields
    });
}