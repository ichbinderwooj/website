const pug = require("pug");
const Popup = require("../lib/popup");
const cookies = require("../lib/cookies");
const youtube = require("../lib/youtube");

module.exports = function (app, dir) {
    app.get("/youtube", function (req, res) {
        youtube.getVideos(function (result) {
            res.render(`${dir}/pug/index.pug`, {
                req: req,
                res: res,
                popups: [
                    (!req.cookies.acceptedCookies) ? new Popup(
                        "cookie",
                        "info",
                        "This site uses cookies",
                        "For more information, please see the <a href=\"/privacy-policy\">privacy policy</a>.",
                        cookies.acceptCookies
                    ) : null
                ],
                navbar: {
                    music: false,
                    youtube: true,
                    other: false,
                    community: false,
                    blog: false,
                    admin: false
                },
                title: "YouTube",
                header: "YouTube",
                content: pug.renderFile(`${dir}/pug/youtube.pug`, {
                    videos: result.items
                })
            });
        });
    });
}