const mailer = require("nodemailer");
const discord = require("./discord");
const config = require("../config.json");
const transporter = mailer.createTransport({
    service: "gmail",
    auth: config.mail
});

module.exports = function (to, subject, content) {
    transporter.sendMail({
        from: config.mail,
        to: to,
        subject: subject,
        html: content
    }, function(err, info) {
        if (err) discord.logErr(err);
    });
}