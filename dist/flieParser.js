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
exports.removeFile = void 0;
const exceljs_1 = require("exceljs");
const fs_1 = __importDefault(require("fs"));
const getCellValue = (row, cellIndex) => {
    const cell = row.getCell(cellIndex);
    return cell.value ? cell.value.toString() : "";
};
const FileParse = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const workbook = new exceljs_1.Workbook();
    const content = yield workbook.xlsx.readFile(filePath);
    const worksheet = content.worksheets[0];
    const rowStartIndex = 1;
    const numberOfRows = worksheet.rowCount;
    const rows = (_a = worksheet.getRows(rowStartIndex, numberOfRows + 1)) !== null && _a !== void 0 ? _a : [];
    const addresses = [
        ...new Set(rows.map((row) => {
            return getCellValue(row, 1);
        })),
    ];
    return addresses;
});
const removeFile = (filePath) => {
    fs_1.default.unlinkSync(filePath);
};
exports.removeFile = removeFile;
exports.default = FileParse;
//# sourceMappingURL=flieParser.js.map