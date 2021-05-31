const showdown = require("showdown");
const turndown = require("turndown");
showdown.setOption("omitExtraWLInCodeBlocks", true);
showdown.setOption("parseImgDimensions", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("strikethrough", true);
showdown.setOption("table", true);
showdown.setOption("tasklists", true);
showdown.setOption("simpleLineBreaks", true);
showdown.setOption("openLinksInNewWindow", true);
showdown.setOption("emoji", true);
showdown.setOption("underline", true);
showdown.setFlavor("github");

module.exports.capitalise = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.toHTML = function (input) {
    let showdownConverter = new showdown.Converter();
    return showdownConverter.makeHtml(input.replace(/<script.*>.*<\/script>/gs, ""));
}

module.exports.toMarkdown = function (input) {
    let turndownService = new turndown({
        emDelimiter: "*"
    }); 
    return turndownService.turndown(input.replace(/<\/?p( .*)?>/g, ""));
}