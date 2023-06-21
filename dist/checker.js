"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOrdinal = exports.quoteRemoval = void 0;
const constant_1 = require("./constant");
const fileCreator_1 = __importDefault(require("./fileCreator"));
const flieParser_1 = __importStar(require("./flieParser"));
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
const ProcessAddressMatching = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sheet1Path = req.files["sheet1"][0].path;
    const sheet2Path = req.files["sheet2"][0].path;
    try {
        const [parsedAddresses1, parsedAddresses2] = yield Promise.all([
            (0, flieParser_1.default)(sheet1Path),
            (0, flieParser_1.default)(sheet2Path),
        ]);
        const output = Array.from(parsedAddresses1, (address1, i) => {
            address1 = (0, exports.quoteRemoval)(address1);
            if (i > parsedAddresses2.length) {
                return [address1, "", "NOT MATCH"];
            }
            const address2 = (0, exports.quoteRemoval)(parsedAddresses2[i]);
            if (address1 && address2) {
                return [
                    address1,
                    address2,
                    getMatchResultString(MatchAddresses(address1, address2)),
                ];
            }
        });
        (0, fileCreator_1.default)(output, res, new Date().toDateString());
    }
    catch (error) {
        res.status(500).send(`
      <html>
        <body>
          <h1>Address Matcher</h1>
          <p>Error: ${error.message}</p>
          <a href="/">Go Back</a>
        </body>
      </html>
    `);
    }
    finally {
        (0, flieParser_1.removeFile)(sheet1Path);
        (0, flieParser_1.removeFile)(sheet2Path);
    }
});
const getMatchResultString = (matchResult) => {
    return matchResult ? "MATCH" : "NOT MATCH";
};
exports.default = ProcessAddressMatching;
