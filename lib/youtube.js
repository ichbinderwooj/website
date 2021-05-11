/*
 * I refuse to use Google's wrapper for this. because
 * I should not need OAuth2 and the like to be able to
 * view my public videos. 
 * 
 * Wait I don't even need this file anymore at this
 * point but I'll keep it I guess.
 */

const http = require("https");
const config = require("../config.json");

exports.getVideos = function (callback) {
    let options = {
        hostname: 'youtube.googleapis.com',
        path: `/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=UU_DxvhbrPCgG0B8OxCHzBfQ&key=${config.youtube.key}`,
        method: "GET",
        headers: {
            "Accept": "/"
        }
    };
    let req = http.request(options, function (res) {
        let chunks = [];
        res.on("data", function (data) {
            chunks.push(data);
        });
        res.on("end", function () {
            let result = JSON.parse(Buffer.concat(chunks).toString());
            callback(result);
        });
    });
    req.on("error", function (error) {
        console.error(error);
    });
    req.end();
}