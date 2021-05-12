module.exports.capitalise = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.parsePost = function (input) {
    let output = input.replace(/<script.*>.*<\/script>/gs, "");
    return output;
}