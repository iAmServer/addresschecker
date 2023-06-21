"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceljs_1 = require("exceljs");
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
exports.default = CreateAndDownloadSheet;
//# sourceMappingURL=fileCreator.js.map