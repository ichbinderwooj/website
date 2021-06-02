const bcrypt = require("bcrypt");
const mysql = require("mysql");
const turndown = new (require("turndown"))();
const md5 = require("md5");
const pug = require("pug");
const mail = require("../lib/mail");
const Popup = require("../lib/popup");
const string = require("../lib/string");
const cookies = require("../lib/cookies");
const discord = require("../lib/discord");
const config = require("../config.json");
const database = mysql.createConnection(config.mysql);

module.exports = function (app, dir) {
    app.get("/community", function (req, res) {
        database.query("SELECT 'forum' AS board, forum.id, forum.title, forum.author_id, users.username, forum.write_time FROM forum LEFT JOIN users ON forum.author_id = users.id UNION ALL SELECT 'announcements' AS board, announcements.id, announcements.title, announcements.author_id, users.username, announcements.write_time FROM announcements LEFT JOIN users ON announcements.author_id = users.id ORDER BY write_time DESC", function (err, result, fields) {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: "Community",
                header: "Community",
                content: pug.renderFile(`${dir}/pug/community/index.pug`, {
                    posts: result
                })
            });
        });
    });

    app.get("/community/register", function (req, res) {
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
                community: true,
                blog: false,
                admin: false
            },
            title: "Register",
            header: "Register",
            content: pug.renderFile(`${dir}/pug/community/register.pug`, {
                emailErr: false,
                usernameErr: false,
                passwordErr: false
            })
        });
    });

    app.post("/community/register", function (req, res) {
        if (req.body.password.trim() != req.body.confirm_password.trim()) {
            passwordErr = true;
        }
        else {
            passwordErr = false;
        }
        database.query("SELECT id FROM users WHERE email=?", [req.body.email], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length == 0) {
                emailErr = false;
            }
            else {
                emailErr = true;
            }
            database.query("SELECT id FROM users WHERE username=?", [req.body.username], function (err, result, fields) {
                if (err) discord.logErr(err);
                if (result.length == 0) {
                    usernameErr = false;
                }
                else {
                    usernameErr = true;
                }
                if (!usernameErr && !emailErr && !passwordErr) {
                    verification = md5(Math.floor(Math.random() * 1000000));
                    database.query("INSERT INTO users (username, email, password, verification) VALUES (?, ?, ?, ?)", [req.body.username, req.body.email, bcrypt.hashSync(req.body.password, 10), verification], function (err, result) {
                        database.query("SELECT id FROM users WHERE username=?", [req.body.username], function (err, result, fields) {
                            if (err) discord.logErr(err);
                            mail(config.mail, req.body.email, "sonwoojin.com registration confirmation", `
                            <h1>sonwoojin.com registration confirmation</h1>
                            <p>Your E-mail Address was used to register an account at sonwoojin.com.</p>
                            <p>Please confirm thi <a href="http://sonwoojin.com/community/verify/${result[0].id}/${verification}">here</a>.</p>
                            `);
                        });
                        res.redirect(`${req.protocol}://${req.get("host")}/community/login`);
                    });
                }
                else {
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
                            community: true,
                            blog: false,
                            admin: false
                        },
                        title: "Register",
                        header: "Register",
                        content: pug.renderFile(`${dir}/pug/community/register.pug`, {
                            emailErr: emailErr,
                            usernameErr: usernameErr,
                            passwordErr: passwordErr
                        })
                    });
                }
            });
        });
    });

    app.get("/community/login", function (req, res) {
        if (!req.session.isLoggedIn) {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: "Log in",
                header: "Log in",
                content: pug.renderFile(`${dir}/pug/community/login.pug`, {
                    err: false
                })
            });
        }
        else {
            res.redirect(`${req.protocol}://${req.get("host")}/community/logout`);
        }
    });

    app.post("/community/login", function (req, res) {
        database.query("SELECT id, username, permissions, password FROM users WHERE email=? OR username=?", [req.body.user, req.body.user], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length == 0 || !bcrypt.compareSync(req.body.password.trim(), result[0].password)) {
                err = true;
            }
            else {
                err = false;
            }
            if (!err) {
                req.session.isLoggedIn = true;
                req.session.userID = result[0].id;
                req.session.username = result[0].username;
                req.session.permissions = result[0].permissions;
                res.redirect(`${req.protocol}://${req.get("host")}/community/`);
            }
            else {
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
                        community: true,
                        blog: false,
                        admin: false
                    },
                    title: "Log in",
                    header: "Log in",
                    content: pug.renderFile(`${dir}/pug/community/login.pug`, {
                        err: true
                    })
                })
            }
        });
    });

    app.get("/community/logout", function (req, res) {
        if (!req.session.isLoggedIn) {
            res.redirect(`${req.protocol}://${req.get("host")}/community/login`);
        }
        else {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: "Log out",
                header: "Log out",
                content: pug.renderFile(`${dir}/pug/community/logout.pug`)
            });
        }
    });

    app.post("/community/logout", function (req, res) {
        req.session.isLoggedIn = false;
        delete req.session.userID;
        delete req.session.username;
        delete req.session.permissions;
        res.redirect(`${req.protocol}://${req.get("host")}/community/login`);
    });

    app.get("/community/verify/:id/:verification", function (req, res) {
        database.query("SELECT id FROM users WHERE id=? AND verification=?", [req.params.id, req.params.verification], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length > 0) {
                database.query("UPDATE users SET permissions=2 WHERE id=?", [req.params.id], function (err, result, fields) {
                    if (err) discord.logErr(err);
                    res.redirect(`${req.protocol}://${req.get("host")}/community/login`);
                });
            }
        });
    });

    app.get("/community/profile", function (req, res) {
        if (!req.session.userID) {
            res.status(404).render(`${dir}/pug/index.pug`, {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: "No user",
                header: "No user",
                content: "A user with that ID does not exist."
            });
        }
        else {
            res.redirect(`${req.protocol}://${req.get("host")}/community/profile/${req.session.userID}`);
        }
    });

    app.get("/community/edit-profile", function (req, res) {
        if (req.session.isLoggedIn && req.session.permissions > 2) {
            database.query("SELECT * FROM users WHERE id = ?", [req.session.userID], function (err, result, fields) {
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
                        community: true,
                        blog: false,
                        admin: false
                    },
                    title: "Edit profile",
                    header: "Edit profile",
                    content: pug.renderFile(`${dir}/pug/community/edit.pug`, {
                        userID: result[0].id,
                        username: result[0].username,
                        email: result[0].email,
                        biography: string.toMarkdown(result[0].biography),
                        usernameErr: false,
                        emailErr: false,
                        passwordErr: false
                    })
                });
            });
        }
        else {
            res.status(404).send({
                "message": "Not found"
            });
        }
    });

    app.post("/community/edit-profile", function (req, res) {
        if (req.session.isLoggedIn) {
            database.query("SELECT password FROM users WHERE id = ?", [req.session.userID], function (err, result, fields) {
                if (err) sendMsg(err);
                if (bcrypt.compareSync(req.body.password, result[0].password)) {
                    passwordErr = false;
                }
                else {
                    passwordErr = true;
                }
                database.query("SELECT id FROM users WHERE email = ?", [req.body.email], function (err, result, fields) {
                    if (err) sendMsg(err);
                    if (result.length == 0) {
                        emailErr = false;
                    }
                    else if (result[0].id == req.session.userID) {
                        emailErr = false;
                    }
                    else {
                        emailErr = true;
                    }
                    database.query("SELECT id FROM users WHERE username = ?", [req.body.username, req.session.userID], function (err, result, fields) {
                        if (err) sendMsg(err);
                        if (result.length == 0) {
                            usernameErr = false;
                        }
                        else if (result[0].id == req.session.userID) {
                            usernameErr = false;
                        }
                        else {
                            usernameErr = true;
                        }
                        if (!passwordErr && !emailErr && !usernameErr) {
                            database.query("UPDATE users SET username = ?, email = ?, biography = ? WHERE id = ?", [req.body.username, req.body.email, string.toHTML(req.body.biography), req.session.userID], function (err, result, fields) {
                                if (err) sendMsg(err);
                                res.redirect(`${req.protocol}://${req.get("host")}/community/profile/${req.session.userID}`);
                            });
                        }
                    });
                });
            });
        }
    });

    app.get("/community/profile/:id", function (req, res) {
        database.query("SELECT id, username, permissions, biography FROM users WHERE id=?", [req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length == 0) {
                res.status(404).render(`${dir}/pug/index.pug`, {
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
                        community: true,
                        blog: false,
                        admin: false
                    },
                    title: "No user",
                    header: "No user",
                    content: "A user with that ID does not exist."
                });
            }
            database.query("SELECT token FROM tokens WHERE user_id = ?", [req.params.id], function (err, _result, fields) {
                isSelf = (req.params.id == req.session.userID)
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
                        community: true,
                        blog: false,
                        admin: false
                    },
                    title: "Profile",
                    header: "Profile",
                    content: pug.renderFile(`${dir}/pug/community/profile.pug`, {
                        userID: result[0].id,
                        userPerms: result[0].permissions,
                        username: result[0].username,
                        biography: result[0].biography,
                        isSelf: isSelf,
                        token: (_result.length) ? _result[0].token : null
                    })
                });
            });
        });
    });

    app.get("/community/change-password", function (req, res) {
        if (req.session.isLoggedIn) {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: "Change password",
                header: "Change password",
                content: pug.renderFile(`${dir}/pug/community/password.pug`, {
                    oldPasswordErr: false,
                    newPasswordErr: false
                })
            });
        }
        else {
            res.send({
                message: "Not found"
            });
        }
    });

    app.post("/community/change-password", function (req, res) {
        if (req.session.isLoggedIn) {
            if (req.body.password == req.body.confirm_password) {
                newPasswordErr = false;
            }
            else {
                newPasswordErr = true;
            }
            database.query("SELECT password FROM users WHERE id = ?", [req.session.userID], function (err, result, fields) {
                if (err) discord.logErr(err);
                if (bcrypt.compareSync(req.body.current_password, result[0].password)) {
                    oldPasswordErr = false;
                }
                else {
                    oldPasswordErr = true;
                }
                if (!oldPasswordErr && !newPasswordErr) {
                    database.query("UPDATE users SET password = ? WHERE id = ?", [bcrypt.hashSync(req.body.password, 10), req.session.userID], function (err, result, fields) {
                        if (err) discord.logErr(err);
                        res.redirect(`${req.protocol}://${req.get("host")}/community/profile/${req.session.userID}`);
                    });
                }
                else {
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
                            community: true,
                            blog: false,
                            admin: false
                        },
                        title: "Change password",
                        header: "Change password",
                        content: pug.renderFile(`${dir}/pug/community/password.pug`, {
                            oldPasswordErr: oldPasswordErr,
                            newPasswordErr: newPasswordErr
                        })
                    });
                }
            });
        }
        else {
            res.send({
                message: "Not found"
            });
        }
    });

    app.post("/community/delete-account", function (req, res) {
        database.query("SELECT password FROM users WHERE id = ?", [req.session.userID], function (err, result, fields) {
            if (bcrypt.compareSync(req.body.password, result[0].password)) {
                database.query("DELETE FROM users WHERE id = ?", [req.session.userID], function (err, result, fields) {
                    database.query("DELETE FROM forum WHERE author_id = ?", [req.session.userID], function (err, result, fields) {
                        database.query("DELETE FROM announcements WHERE author_id = ?", [req.session.userID], function (err, result, fields) {
                            database.query("DELETE FROM forum_comments WHERE author_id = ?", [req.session.userID], function (err, result, fields) {
                                database.query("DELETE FROM announcements_comments WHERE author_id = ?", [req.session.userID], function (err, result, fields) {
                                    database.query("DELETE FROM tokens WHERE user_id = ?", [req.session.userID], function (err, result, fields) {
                                        req.session.isLoggedIn = false;
                                        delete req.session.userID;
                                        delete req.session.username;
                                        delete req.session.permissions;
                                        res.redirect(`${req.protocol}://${req.get("host")}/community`);
                                    });
                                });
                            });
                        });
                    });
                });
            }
        });
    });

    app.get("/community/board/:board", function (req, res) {
        if ((req.params.board != "forum") && (req.params.board != "announcements")) {
            res.status(404).send({
                "message": "Not found"
            });
            return;
        }
        database.query("SELECT ??.id, ??.title, ??.author_id, users.username, ??.write_time FROM ?? LEFT JOIN users ON ??.author_id = users.id", [req.params.board, req.params.board, req.params.board, req.params.board, req.params.board, req.params.board], function (err, result, fields) {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: string.capitalise(req.params.board),
                header: string.capitalise(req.params.board),
                content: pug.renderFile(`${dir}/pug/community/posts.pug`, {
                    isLoggedIn: req.session.isLoggedIn,
                    board: req.params.board,
                    url: `${req.protocol}://${req.get("host")}`,
                    posts: result
                })
            });
        });
    });

    app.get("/community/board/:board/write", function (req, res) {
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
        if (req.session.permissions >= minPerms) {
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
                    community: true,
                    blog: false,
                    admin: false
                },
                title: "Write Post",
                header: "Write Post",
                content: pug.renderFile(`${dir}/pug/community/write.pug`, {
                    board: req.params.board,
                    isEdit: false,
                })
            });
        }
        else {
            console.log(req.session.permissions);
            res.status(403).send();
        }
    });

    app.post("/community/board/:board/write", function (req, res) {
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
        if (req.session.userID != 0 && req.session.permissions >= minPerms) {
            database.query("INSERT INTO ?? (title, author_id, content) VALUES (?, ?, ?)", [req.params.board, req.body.title, req.session.userID, string.toHTML(req.body.content)], function (err, result, fields) {
                if (err) discord.logErr(err);
                database.query("SELECT id FROM ?? ORDER BY id DESC LIMIT 1", [req.params.board], function (err, result, fields) {
                    if (err) discord.logErr(err);
                    discord.sendEmbed(channel, {
                        title: req.body.title,
                        color: 0x00ffff,
                        description: string.toMarkdown(string.toHTML(req.body.content)),
                        fields: [{
                            name: "Link:",
                            value: `http://sonwoojin.com/community/board/${req.params.board}/${result[0].id}`,
                            inline: false
                        }]
                    });
                    res.redirect(`${req.protocol}://${req.get("host")}/community/board/${req.params.board}/${result[0].id}`);
                });
            });
        }
        else {
            res.status(403).send();
        }
    });

    app.get("/community/board/:board/:id", function (req, res) {
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
        database.query("SELECT ??.title, ??.author_id, users.username, ??.content, ??.write_time FROM ?? LEFT JOIN users ON ??.author_id = users.id WHERE ??.id = ?", [req.params.board, req.params.board, req.params.board, req.params.board, req.params.board, req.params.board, req.params.board, req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length == 0) {
                res.status(404).send({
                    "message": "Not found"
                });
                return;
            }
            database.query("SELECT ??.id, ??.author_id, users.username, ??.content, ??.write_time FROM ?? LEFT JOIN users ON ??.author_id = users.id WHERE ??.reply_to = ?", [`${req.params.board}_comments`, `${req.params.board}_comments`, `${req.params.board}_comments`, `${req.params.board}_comments`, `${req.params.board}_comments`, `${req.params.board}_comments`, `${req.params.board}_comments`, req.params.id], function (err, _result, fields) {
                if (err) discord.logErr(err);
                for (i = 0; i < _result.length; i++) {
                    if (req.session.userID == _result[i].author_id) {
                        _result[i].isAuthor = true;
                    }
                    else {
                        _result[i].isAuthor = false;
                    }
                }
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
                        community: true,
                        blog: false,
                        admin: false
                    },
                    title: result[0].title,
                    header: result[0].title,
                    content: pug.renderFile(`${dir}/pug/community/read.pug`, {
                        board: req.params.board,
                        id: req.params.id,
                        url: `${req.protocol}://${req.get("host")}`,
                        author: result[0].username,
                        writeTime: result[0].write_time,
                        content: result[0].content,
                        isAuthor: (req.session.userID == result[0].author_id) ? true : false,
                        comments: _result,
                        userPerms: req.session.permissions
                    })
                });
            });
        });
    });

    app.post("/community/board/:board/:id", function (req, res) {
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
        database.query("SELECT author_id FROM ?? WHERE id = ?", [req.params.board, req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result[0].author_id == req.session.userID) {
                database.query("UPDATE ?? SET title = ?, content = ? WHERE id = ?", [req.params.board, req.body.title, string.toHTML(req.body.content), req.params.id], function (err, result, fields) {
                    discord.logErr(err);
                    res.redirect(`${req.protocol}://${req.get("host")}/community/board/${req.params.board}/${req.params.id}`);
                });
            }
            else {
                res.status(403).send();
            }
        });
    });

    app.post("/community/board/:board/:id/delete", function (req, res) {
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
        database.query("SELECT author_id FROM ?? WHERE id = ?", [req.params.board, req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result[0].author_id == req.session.userID) {
                database.query("DELETE FROM ?? WHERE id = ?", [req.params.board, req.params.id], function (err, result, fields) {
                    if (err) discord.logErr(err);
                    res.redirect(`${req.protocol}://${req.get("host")}/community/board/${req.params.board}`);
                });
            }
            else {
                res.status(403).send();
            }
        });
    });

    app.get("/community/board/:board/:id/edit", function (req, res) {
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
        database.query("SELECT author_id, title, content FROM ?? WHERE id = ?", [req.params.board, req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result[0].author_id == req.session.userID) {
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
                        community: true,
                        blog: false,
                        admin: false
                    },
                    title: "Write Post",
                    header: "Write Post",
                    content: pug.renderFile(`${dir}/pug/community/write.pug`, {
                        board: req.params.board,
                        isEdit: true,
                        id: req.params.id,
                        title: result[0].title,
                        content: result[0].content,
                        url: `${req.protocol}://${req.get("host")}`
                    })
                });
            }
            else {
                res.status(403).send();
            }
        });
    });

    app.post("/community/board/:board/:id/comment", function (req, res) {
        if (req.session.permissions >= 2) {
            database.query("INSERT INTO ?? (author_id, reply_to, content) VALUES (?, ?, ?)", [`${req.params.board}_comments`, req.session.userID, req.params.id, req.body.comment], function (err, result, fields) {
                if (err) discord.logErr(err);
                res.redirect(`${req.protocol}://${req.get("host")}/community/board/${req.params.board}/${req.params.id}`);
            });
        }
    });

    app.post("/community/board/:board/comment/:id/delete", function (req, res) {
        database.query("SELECT author_id, reply_to FROM ?? WHERE id = ?", [`${req.params.board}_comments`, req.params.id], function (err, result, fields) {
            if (err) discord.logErr(err);
            if (result.length == 0) {
                res.status(404).send({
                    "message": "Not found"
                });
                return;
            }
            if (result[0].author_id == req.session.userID) {
                database.query("DELETE FROM ?? WHERE id = ?", [`${req.params.board}_comments`, req.params.id], function (err, _result, fields) {
                    res.redirect(`${req.protocol}://${req.get("host")}/community/board/${req.params.board}/${result[0].reply_to}`);
                });
            }
        });
    });
}