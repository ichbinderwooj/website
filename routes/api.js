const turndown = new (require("turndown"))();
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const pug = require("pug");
const Popup = require("../lib/popup");
const cookies = require("../lib/cookies");
const discord = require("../lib/discord");
const string = require("../lib/string");
const config = require("../config.json");
const database = mysql.createConnection(config.mysql);

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

module.exports = function (app, dir) {
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
                    channel = "828909486550810625";
                    break;
                case "announcements":
                    minPerms = 3;
                    channel = "828909456154689596";
                    break;
                default:
                    res.status(404).send({
                        "message": "Not found"
                    });
                    return;
            }
            database.query("SELECT user_id, user_perms FROM tokens WHERE token = ?", [req.header("Authorization")], function (err, result, fields) {
                if (err) discord.logErr(err);
                if (result[0].user_perms < minPerms) {
                    res.status(403).send({
                        message: "Forbidden"
                    });
                    return;
                }
                database.query("INSERT INTO ?? (title, author_id, content) VALUES (?, ?, ?)", [req.params.board, req.body.title, result[0].user_id, string.parsePost(req.body.content)], function (err, result, fields) {
                    if (err) {
                        discord.logErr(err);
                        res.status(500).send({
                            "message": "Internal Server error."
                        });
                        return;
                    }
                    database.query("SELECT * FROM ?? ORDER BY id DESC LIMIT 1", [req.params.board], function (err, result, fields) {
                        discord.sendEmbed(channel, {
                            title: req.body.title,
                            color: 0x00ffff,
                            description: turndown(req.body.content),
                            fields: [{
                                name: "Link:",
                                value: `http://sonwoojin.com/community/board/${req.params.board}/${result[0].id}`,
                                inline: false
                            }]
                        });
                        res.status(201).send(result[0]);
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
}