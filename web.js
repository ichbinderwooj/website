const session = require("express-session");
const express = require("express");
const cookie = require("cookie-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const pug = require("pug");
const dns = require("dns");
const os = require("os");
const discord = require("./lib/discord");
const cookies = require("./lib/cookies");
const Popup = require("./lib/popup");
const config = require("./config.json");
const music = require("./routes/music");
const youtube = require("./routes/youtube");
const other = require("./routes/other-projects");
const community = require("./routes/community");
const blog = require("./routes/blog");
const app = express();
const port = 8001;
const dir = __dirname;
const database = mysql.createConnection(config.mysql);

app.set("views", `${dir}/pug`);
app.set("view engine", "pug");

app.use(express.static(`${dir}/static`));
app.use(express.urlencoded({ 
    extended: false 
}));
app.use(session({
    secret: config.session.secret,
    saveUninitialized: true,
    resave: true
}));
app.use(cookie());

app.get("/", function (req, res) {
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
            admin: false
        },
        title: "SONWOOJIN",
        header: "Welcome to sonwoojin.com",
        content: "Welcome to my website! I wish you a pleasant stay."
    });
});

app.get("/privacy-policy", function (req, res) {
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
            admin: false
        },
        title: "Privacy Policy",
        header: "Privacy Policy",
        content: pug.renderFile(`${dir}/pug/privacy-policy.pug`)
    });
});

app.get("/acknowledgements", function (req, res) {
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
            admin: false
        },
        title: "Acknowledgements",
        header: "Acknowledgements",
        content: pug.renderFile(`${dir}/pug/acknowledgements.pug`)
    });
});

app.get("/license", function (req, res) {
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
            admin: false
        },
        title: "License",
        header: "License",
        content: pug.renderFile(`${dir}/pug/license.pug`)
    });
});

app.get("/admin", function (req, res) {
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
                admin: true
            },
            title: "Admin Panel",
            header: "Admin Panel",
            content: pug.renderFile(`${dir}/pug/admin.pug`, {
                permissions: req.session.permissions,
                env: process.env
            })
        });
    }
});

app.get("/cookie", function (req, res) {
    const day = 1000 * 60 * 60 * 24;
    req.session.cookie.expires = false;
    res.cookie("acceptedCookies", true, {maxAge: 10000 * day}).send({
        message: "OK"
    });
});

music(app, dir);
youtube(app, dir);
other(app, dir);
community(app, dir);
blog(app, dir);

function validate(req, res, callback) {
    console.log(req.headers);
    database.query("SELECT * FROM tokens", function (err, result, fields) {
        if (err) discord.logErr(err);
        if (req.header("Authorization")) {
            for (i = 0; i < result.length; i++) {
                if (req.header("Authorization") == result[i].token) {
                    _result = result[i];
                    isAuthorized = true;
                    break;
                }
            }
            isAuthorized = isAuthorized ? true : false;
            if ( _result.uses == 0) {
                database.query("SELECT id, username FROM users WHERE id = ?", [result[0].user_id], function (err, result, fields) {
                    discord.logWarn("API use note", "Someone made too many requests to the API", {
                        name: `username: ${result[0].username}`,
                        value: `id: ${result[0].id}`
                    });
                    res.status(429).send({
                        message: "Too many requests"
                    });
                });
            }
            else if (isAuthorized) {
                database.query("UPDATE tokens SET uses = uses - 1 WHERE user_id = ?", [_result.user_id], function (err, result, fields) {
                    callback();
                });
            }
            else {
                discord.logWarn("API use note", "Someone made an unauthorized API request!");
                res.status(401).send({
                    message: "Unauthorized"
                });
            }
        }
        else {
            discord.logWarn("API use note", "Someone made an unauthorized API request!");
            res.status(401).send({
                message: "Unauthorized"
            });
        }
    });
}

app.get("/api", function (req, res) {
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
            admin: false
        },
        title: "API",
        header: "API",
        content: pug.renderFile(`${dir}/pug/api.pug`)
    });
});

app.post("/api/generate-token", function (req, res) {
    database.query("SELECT token FROM tokens WHERE user_id = ?", [req.session.userID], function(err, result, fields) {
        if (err) discord.logErr(err);
        let token = bcrypt.hashSync(Math.floor(Math.random() * 1000000).toString(), 10).replace(/\$./g, "");
        if (result.length == 0) {
            database.query("INSERT INTO tokens (user_id, user_perms, token) VALUES (?, ?, ?)", [req.session.userID, req.session.permissions, token], function(err, result, fields) {
                if (err) discord.logErr(err);
                res.redirect(`${req.protocol}://${req.get("host")}/community/profile/${req.session.userID}`);
            });
        }
        else {
            database.query("UPDATE tokens SET user_perms = ?, token = ?", [req.session.permissions, token], function(err, result, fields) {
                if (err) discord.logErr(err);
                res.redirect(`${req.protocol}://${req.get("host")}/community/profile/${req.session.userID}`);
            });
        }
    });
});

app.get("/api/user/:id", function (req, res) {
    validate(req, res, function () {
        database.query("SELECT id, username, permissions, biography FROM users WHERE id=?", [req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result == []) {
                res.status(404).send({
                    message: "Not found"
                });
                return;
            }
            res.send({
                id: result[0].id,
                username: result[0].username,
                permissions: result[0].permissions,
                biography: result[0].biography
            });
        });
    });
});

app.get("/api/board/:board/:id", function (req, res) {
    validate(req, res, function () {
        switch (req.params.board) {
            case "forum":
                minPerms = 2;
                break;
            case "announcements":
                minPerms = 3;
                break;
            default:
                res.status(404).send({
                    "message": "Not found"
                });
                return;
        }
        database.query("SELECT * FROM ?? WHERE id = ?", [req.params.board, req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result == []) {
                res.status(404).send({
                    message: "Not found"
                });
                return;
            }
            database.query("SELECT id, author_id, content, write_time FROM ?? WHERE reply_to = ?", [`${req.params.board}_comments`, req.params.id], function (err, _result, fields) {
                res.send({
                    id: result[0].id,
                    title: result[0].title,
                    author_id: result[0].author_id,
                    content: result[0].content,
                    write_time: result[0].write_time,
                    comments: _result
                });
            });
        });
    });
});

app.post("/api/board/:board", function (req, res) {
    validate(req, res, function () {
        switch (req.params.board) {
            case "forum":
                minPerms = 2;
                break;
            case "announcements":
                minPerms = 3;
                break;
            default:
                res.status(404).send({
                    "message": "Not found"
                });
                return;
        }
        database.query("SELECT user_id, user_perms FROM tokens WHERE token = ?", [req.header("Authorization")], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result[0].user_perms < 2) {
                res.status(403).send({
                    message: "Forbidden"
                });
                return;
            }
            database.query("INSERT INTO ?? (title, author_id, content) VALUES (?, ?, ?)", [req.params.board, req.body.title, result[0].user_id, req.body.content], function (err, result, fields) {
                if (err) {
                    discord.logErr(err);
                    res.status(500).send({
                        "message": "Internal Server error."
                    });
                    return;
                }
                database.query("SELECT * FROM ?? ORDER BY id DESC LIMIT 1", [req.params.board], function (err, result, fields) {
                    res.status(201).send({
                        message: "Created"
                    });
                });
            });
        });
    });
});

app.get("/api/info", function (req, res) {
    validate(req, res, function () {
        database.query("SELECT user_perms, uses FROM tokens WHERE token = ?", [req.header("Authorization")], function (err, result, fields) {
            if (err) discord.logErr(err);
            res.send({
                userPerms: result[0].user_perms,
                uses: result[0].uses
            });
        });
    });
});

app.listen(port, function () {
    dns.lookup(os.hostname(), function (err, add, fam) {
        if (err) discord.logErr(err);
        switch (add) {
            case config.ip.remote:
                url = "http://sonwoojin.com"
                break;
            case config.ip.local:
                url = `http://localhost:${port}`;
                break;
            default:
                try {
                    throw Error("When the IP is sus");
                }
                catch (Error) {
                    discord.logErr(Error);
                }
                return;
        }
        discord.logSucc("Website launched", `The website was launched on ${url}`);
    });
});

setInterval(function () {
    database.query("UPDATE tokens SET uses=60");
}, 60000);