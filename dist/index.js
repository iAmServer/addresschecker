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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const checker_1 = require("./checker");
const fileCreator_1 = __importDefault(require("./fileCreator"));
const flieParser_1 = __importStar(require("./flieParser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const upload = (0, multer_1.default)({ dest: "uploads/" });
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Address Matcher</title>
      </head>
      <body>
        <h1>Address Matcher</h1>
        <form method="POST" action="/match" enctype="multipart/form-data">
          <label for="sheet1">Sheet 1:</label>
          <input type="file" id="sheet1" name="sheet1" required><br><br>
          <label for="sheet2">Sheet 2:</label>
          <input type="file" id="sheet2" name="sheet2" required><br><br>
          <input type="submit" value="Check Match">
        </form>
      </body>
    </html>
  `);
});
app.post("/match", 
// upload.array("files"),
upload.fields([
    { name: "sheet1", maxCount: 1 },
    { name: "sheet2", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let sheet1Path, sheet2Path;
    try {
        const files = req.files;
        sheet1Path = files.sheet1[0].path;
        sheet2Path = files.sheet2[0].path;
        if (!sheet1Path || !sheet2Path) {
            return res
                .status(500)
                .send(ErrorResponse("Both files are required for the script to run"));
        }
        const [parsedAddresses1, parsedAddresses2] = yield Promise.all([
            (0, flieParser_1.default)(sheet1Path),
            (0, flieParser_1.default)(sheet2Path),
        ]);
        if (parsedAddresses1.length !== parsedAddresses2.length) {
            return res
                .status(500)
                .send(ErrorResponse("The number of address in the files are not equal, please make sure they are before running the script"));
        }
        const output = Array.from(parsedAddresses1, (address1, i) => {
            address1 = (0, checker_1.quoteRemoval)(address1);
            const address2 = (0, checker_1.quoteRemoval)(parsedAddresses2[i]);
            if (address1 && address2) {
                return [
                    address1,
                    address2,
                    (0, checker_1.getMatchResultString)((0, checker_1.MatchAddresses)(address1, address2)),
                ];
            }
        });
        (0, fileCreator_1.default)(output, res, new Date().toDateString());
    }
    catch (error) {
        res.status(500).send(ErrorResponse(error.message));
    }
    finally {
        (0, flieParser_1.removeFile)(sheet1Path);
        (0, flieParser_1.removeFile)(sheet2Path);
    }
}));
console.log(`150 Washington Avenue vs 150 Washington Ave ${(0, checker_1.MatchAddresses)("150 Washington Avenue", "150 Washington Ave")
    ? "Matches"
    : "Does not match"}`);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
const ErrorResponse = (error) => {
    return `<html>
        <body>
          <h1>Address Matcher</h1>
          <p>Error: ${error}</p>
          <a href="/">Go Back</a>
        </body>
      </html>`;
};
//# sourceMappingURL=index.js.map