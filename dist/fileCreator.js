"use strict";
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
exports.storeAddresses = void 0;
const exceljs_1 = require("exceljs");
const fs_1 = __importDefault(require("fs"));
const CreateAndDownloadSheet = (output, res, fileName) => {
    const workbook = new exceljs_1.Workbook();
    const worksheet = workbook.addWorksheet("Output");
    worksheet.addRow(["Address 1", "Address 2", "Output"]);
    output.forEach((row) => {
        worksheet.addRow(row);
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);
    workbook.xlsx.write(res).then(() => {
        res.end();
    });
};
function storeAddresses(addresses) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile("addresses.txt", addresses, (err) => {
                if (err) {
                    console.error("Error storing addresses1:", err);
                    reject(err);
                }
                else {
                    console.log("Addresses1 stored successfully.");
                    resolve();
                }
            });
        });
    });
}
exports.storeAddresses = storeAddresses;
exports.default = CreateAndDownloadSheet;
//# sourceMappingURL=fileCreator.js.map