const pug = require("pug");
const Popup = require("../lib/popup");
const cookies = require("../lib/cookies");

module.exports = function (app, dir) {
    app.get("/other", function (req, res) {
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
                youtube: false,
                other: true,
                community: false,
                blog: false,
                admin: false
            },
            title: "Other Projects",
            header: "Other Projects",
            content: pug.renderFile(`${dir}/pug/other-projects/index.pug`)
        });
    });
}