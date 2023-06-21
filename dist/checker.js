"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOrdinal = exports.quoteRemoval = void 0;
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
// const ProcessAddressMatching = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const files = req.files as FileArray;
// console.log(req.files.sheet1);
// console.log(files);
// const sheet1Path = files.sheet1[0].path; //files["sheet1"][0].path;
// const sheet2Path = files.sheet1[0].path;
// try {
//   const [parsedAddresses1, parsedAddresses2] = await Promise.all([
//     FileParse(sheet1Path),
//     FileParse(sheet2Path),
//   ]);
//   const output = Array.from(parsedAddresses1, (address1, i) => {
//     address1 = quoteRemoval(address1);
//     if (i > parsedAddresses2.length) {
//       return [address1, "", "NOT MATCH"];
//     }
//     const address2 = quoteRemoval(parsedAddresses2[i]);
//     if (address1 && address2) {
//       return [
//         address1,
//         address2,
//         getMatchResultString(MatchAddresses(address1, address2)),
//       ];
//     }
//   });
//   CreateAndDownloadSheet(output, res, new Date().toDateString());
// } catch (error) {
//   res.status(500).send(`
//     <html>
//       <body>
//         <h1>Address Matcher</h1>
//         <p>Error: ${error.message}</p>
//         <a href="/">Go Back</a>
//       </body>
//     </html>
//   `);
// } finally {
//   removeFile(sheet1Path);
//   removeFile(sheet2Path);
// }
// };
const getMatchResultString = (matchResult) => {
    return matchResult ? "MATCH" : "NOT MATCH";
};
// export default ProcessAddressMatching;
//# sourceMappingURL=checker.js.map