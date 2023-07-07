"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOrdinal = exports.compareArrays = exports.quoteRemoval = void 0;
const constant_1 = require("./constant");
const getStreetFromAddress = (address) => {
    const match = (0, exports.quoteRemoval)(getStreetFromAddress2(address))
        .split(":")[0]
        .split(",");
    if (match && match.length > 0) {
        return match[0].trim();
    }
    return "";
};
const getStreetFromAddress2 = (address) => {
    const splitAddress = address.split("-");
    if (splitAddress.length > 0) {
        const firstPart = splitAddress[0].trim();
        return firstPart;
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
function compareArrays(arr1, arr2) {
    const formattedAddresses1 = [];
    const formattedAddresses2 = [];
    const matchingPairs = [];
    for (const item of arr1) {
        const formattedAddress = formatAddress(getStreetFromAddress(item)).trim();
        formattedAddresses1.push(formattedAddress);
    }
    for (const item of arr2) {
        const formattedAddress = formatAddress(getStreetFromAddress(item)).trim();
        formattedAddresses2.push(formattedAddress);
    }
    for (let i = 0; i < formattedAddresses1.length; i++) {
        const str1 = formattedAddresses1[i];
        if (formattedAddresses2.includes(str1)) {
            const matchedIndex = formattedAddresses2.findIndex((str2) => str2 === str1);
            if (matchedIndex !== -1) {
                matchingPairs.push([arr1[i], arr2[matchedIndex], "MATCHED"]);
            }
        }
    }
    return matchingPairs;
}
exports.compareArrays = compareArrays;
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
//# sourceMappingURL=checker.js.map