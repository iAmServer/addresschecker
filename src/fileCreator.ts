import { Workbook } from "exceljs";
import { Response } from "express";

const CreateAndDownloadSheet = (
  output: any[][],
  res: Response,
  fileName: string
): void => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Output");

  worksheet.addRow(["Address 1", "Address 2", "Output"]);

  output.forEach((row) => {
    worksheet.addRow(row);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);

  workbook.xlsx.write(res).then(() => {
    res.end();
  });
};

export default CreateAndDownloadSheet;
