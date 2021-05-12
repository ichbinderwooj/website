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
const api = require("./routes/api");
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
    res.cookie("acceptedCookies", true, { maxAge: 10000 * day }).send({
        message: "OK"
    });
});

music(app, dir);
youtube(app, dir);
other(app, dir);
community(app, dir);
blog(app, dir);
api(app, dir);

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