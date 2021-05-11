const pug = require("pug");
const mysql = require("mysql");
const discord = require("../lib/discord");
const config = require("../config.json");
const database = mysql.createConnection(config.mysql);

module.exports = function (app, dir) {
    app.get("/blog", function (req, res) {
        database.query("SELECT * FROM blog", function (err, result, fields) {
            if (err) discord.logErr(err);
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
                    other: false,
                    community: false,
                    blog: true,
                    admin: false
                },
                title: "Blog",
                header: "Blog",
                content: pug.renderFile(`${dir}/pug/blog/index.pug`, {
                    permissions: req.session.permissions,
                    posts: result
                })
            });
        });
    });

    app.get("/blog/read/:id", function(req, res) {
        database.query("SELECT * FROM blog WHERE id = ?", [req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length != 0) {
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
                        other: false,
                        community: false,
                        blog: true,
                        admin: false
                    },
                    title: result[0].title,
                    header: result[0].title,
                    content: pug.renderFile(`${dir}/pug/blog/read.pug`, {
                        writeTime: result[0].write_time,
                        content: result[0].content
                    })
                });
            }
        });
    });

    app.get("/blog/write", function (req, res) {
        if (req.session.permissions == 6) {
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
                    other: false,
                    community: false,
                    blog: true,
                    admin: false
                },
                title: "Write new blog post",
                header: "Write new blog post",
                content: pug.renderFile(`${dir}/pug/blog/write.pug`)
            });
        }
    });

    app.post("/blog/write", function(req, res) {
        if (req.session.permissions == 6) {
            database.query("INSERT INTO blog (title, content) VALUES (?, ?)", [req.body.title, req.body.content], function(err, result, fields) {
                if (err) discord.logErr(err);
                database.query("SELECT id FROM blog ORDER BY id DESC LIMIT 1", function(err, result, fields) {
                    if (err) discord.logErr(err);
                    res.redirect(`${req.protocol}://${req.get("host")}/blog/read/${result[0].id}`);
                });
            });
        }
    });
}