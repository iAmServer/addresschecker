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
const fileCreator_1 = __importStar(require("./fileCreator"));
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
        
        <p>If you have the excel files, click the file checker otherwsise click normal checker</p>

        <a href="/file">File Checker</a> &nbsp&nbsp&nbsp&nbsp&nbsp
        <a href="/input">Normal Checker</a>
      </body>
    </html>
  `);
});
app.get("/file", (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Address Matcher</title>
      </head>
      <body>
        <h1>Address Matcher</h1>
        <form method="POST" action="/match/file" enctype="multipart/form-data">

          <label for="sheet1">Sheet 1 <i>This is the main file</i>:</label>
          <input type="file" id="sheet1" name="sheet1" required accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" /><br><br>

          <label for="sheet2">Sheet 2:</label>
          <input type="file" id="sheet2" name="sheet2" required accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" /><br><br>

          <label for="addresses2">Export to excel? 
            <input type="checkbox" name="export" />
          </label><br><br>

          <input type="submit" value="Check Match">
        </form>
      </body>

      <br /><br /><a href="/">Go Back</a>
    </html>
  `);
});
app.get("/input", (req, res) => {
    res.send(`
    <html>
      <head>
        <title>Address Matcher</title>
      </head>
      <body>
        <h1>Address Matcher</h1>
        <form method="POST" action="/match">
          <p>Each address should be on a new line</p>

          <label for="useOldStoreAddresses">Use Stored Addressess for Addresses 1:</label>
          <input type="checkbox" id="useOldStoreAddresses" name="useOldStoreAddresses"><br /><br />

          <p>NB: For every new addressess1 it overrides the stored addresses on the system</p>

          <div id="addresses1Container">
            <label for="addresses1">Addresses 1 <i>This is the main address</i>:</label><br />
            <textarea id="addresses1" name="addresses1" rows="5" required></textarea><br /><br />
          </div>

          <label for="addresses2">Addresses 2:</label><br />
          <textarea id="addresses2" name="addresses2" rows="5" required></textarea><br /><br />
          
          <label for="addresses2">Export to excel? 
            <input type="checkbox" name="export" />
          </label><br /><br />

          <input type="submit" value="Check Match">
        </form>

        <script>
          const useOldStoreAddressCheckbox = document.getElementById("useOldStoreAddresses");
          const addresses1Container = document.getElementById("addresses1Container");
          const addresses1Textarea = document.getElementById("addresses1");

          useOldStoreAddressCheckbox.addEventListener("change", function() {
            addresses1Container.style.display = this.checked ? "none" : "block";
            addresses1Textarea.disabled = this.checked;
            if (this.checked) {
              addresses1Textarea.removeAttribute("required");
            } else {
              addresses1Textarea.setAttribute("required", "required");
            }
          });
        </script>

        <br /><br /><a href="/">Go Back</a>
      </body>
    </html>
  `);
});
app.post("/match", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const addresses1 = req.body.addresses1;
    const addresses2 = req.body.addresses2;
    const useOldStoreAddresses = req.body.useOldStoreAddresses === "on" ? true : false;
    const exportOutput = req.body.export === "on" ? true : false;
    if ((!addresses1 || !useOldStoreAddresses) && !addresses2) {
        return res
            .status(400)
            .send(ErrorResponse("Both address fields are required"));
    }
    try {
        let parsedAddresses1 = [];
        const parsedAddresses2 = addresses2.split("\r\n");
        const storedAddresses = yield (0, flieParser_1.retrieveAddresses)();
        if (useOldStoreAddresses && storedAddresses) {
            return res
                .status(400)
                .send(ErrorResponse("There's currently no stored address on the system"));
        }
        parsedAddresses1 = storedAddresses.split("\r\n");
        if (useOldStoreAddresses === false) {
            yield (0, fileCreator_1.storeAddresses)(addresses1);
            parsedAddresses1 = addresses1.split("\r\n");
        }
        if (exportOutput) {
            FileOutput(parsedAddresses1, parsedAddresses2, res);
        }
        else {
            TableOutput(parsedAddresses1, parsedAddresses2, res);
        }
    }
    catch (error) {
        return res.status(500).send(ErrorResponse(error.message));
    }
}));
app.post("/match/file", upload.fields([
    { name: "sheet1", maxCount: 1 },
    { name: "sheet2", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const exportOutput = req.body.export === "on";
    let sheet1Path;
    let sheet2Path;
    try {
        const files = req.files;
        sheet1Path = files.sheet1[0].path;
        sheet2Path = files.sheet2[0].path;
        if (!sheet1Path || !sheet2Path) {
            return res
                .status(400)
                .send(ErrorResponse("Both files are required for the script to run"));
        }
        const [parsedAddresses1, parsedAddresses2] = yield Promise.allSettled([
            (0, flieParser_1.default)(sheet1Path),
            (0, flieParser_1.default)(sheet2Path),
        ]);
        if (parsedAddresses1.status === "rejected" ||
            parsedAddresses2.status === "rejected") {
            return res
                .status(400)
                .send(ErrorResponse("We couldn't parse one or both files, please look into the uploaded file and try again"));
        }
        if (exportOutput) {
            FileOutput(parsedAddresses1.value, parsedAddresses2.value, res);
        }
        else {
            TableOutput(parsedAddresses1.value, parsedAddresses2.value, res);
        }
    }
    catch (error) {
        res.status(500).send(ErrorResponse(error.message));
    }
    finally {
        if (sheet1Path) {
            (0, flieParser_1.removeFile)(sheet1Path);
        }
        if (sheet2Path) {
            (0, flieParser_1.removeFile)(sheet2Path);
        }
    }
}));
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
const TableOutput = (parsedAddresses1, parsedAddresses2, res) => {
    const output = (0, checker_1.compareArrays)(parsedAddresses1, parsedAddresses2);
    res.status(200).send(`
      <html>
        <head>
          <title>Address Matcher - Results</title>
        </head>
        <body>
          <h1>Address Matcher - Results</h1>
          <table>
            <tr>
              <th>Address 1</th>
              <th>Address 2</th>
            </tr>
            ${output
        .filter(Boolean)
        .map(([address1, address2, output]) => address1 &&
        address2 &&
        output &&
        `
                <tr>
                  <td>${address1}</td>
                  <td>${address2}</td>
                  <td>${output}</td>
                </tr>
              `)
        .join("")}
          </table>
          <a href="/">Go Back</a>
        </body>
      </html>
    `);
};
const FileOutput = (parsedAddresses1, parsedAddresses2, res) => {
    const output = (0, checker_1.compareArrays)(parsedAddresses1, parsedAddresses2);
    (0, fileCreator_1.default)(output, res, new Date().toDateString());
};
//# sourceMappingURL=index.js.map