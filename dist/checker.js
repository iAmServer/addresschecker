"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatchResultString = exports.removeOrdinal = exports.MatchAddresses = exports.quoteRemoval = void 0;
const constant_1 = require("./constant");
const getStreetFromAddress = (address) => {
    const match = (0, exports.quoteRemoval)(address).split(":")[0].split("-")[0].split(",");
    if (match && match.length > 0) {
        return match[0].trim();
    }
    return "";
};
const quoteRemoval = (str) => {
    try {
        return str.replace(/^"(.*)"$/, "$1");
    }
    catch (error) {
        return str;
    }
};
exports.quoteRemoval = quoteRemoval;
const formatAddress = (address) => {
    const parts = (0, exports.removeOrdinal)(address).toLowerCase().trim().split(" ");
    const formattedParts = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part in constant_1.streetTypeAbbreviations) {
            formattedParts.push(constant_1.streetTypeAbbreviations[part]);
        }
        else if (part in constant_1.directionAbbreviations) {
            formattedParts.push(constant_1.directionAbbreviations[part]);
        }
        else if (part in constant_1.otherComponents) {
            formattedParts.push(constant_1.otherComponents[part]);
        }
        else {
            formattedParts.push(part);
        }
    }
    return formattedParts.join(" ").trim();
};
const MatchAddresses = (address1, address2) => {
    const formattedAddress1 = formatAddress(getStreetFromAddress(address1)).trim();
    const formattedAddress2 = formatAddress(getStreetFromAddress(address2)).trim();
    return (formattedAddress2 === formattedAddress1 ||
        formattedAddress2.includes(formattedAddress1) ||
        formattedAddress1.includes(formattedAddress2));
};
exports.MatchAddresses = MatchAddresses;
const ordinalRemoval = (value) => {
    return value.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
};
const isOrdinal = (word) => {
    const regex = /(\d+)(st|nd|rd|th)/i;
    return regex.test(word);
};
const removeOrdinal = (address) => {
    const words = address.split(" ");
    for (let i = 0; i < words.length; i++) {
        if (isOrdinal(words[i])) {
            words[i] = ordinalRemoval(words[i]);
        }
    }
    return words.join(" ");
};
exports.removeOrdinal = removeOrdinal;
const getMatchResultString = (matchResult) => {
    return matchResult ? "MATCH" : "NOT MATCH";
};
exports.getMatchResultString = getMatchResultString;
//# sourceMappingURL=checker.js.map