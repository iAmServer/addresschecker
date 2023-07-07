import { Workbook } from "exceljs";
import fs from "fs";
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

export async function storeAddresses(addresses: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile("addresses.txt", addresses, (err) => {
      if (err) {
        console.error("Error storing addresses1:", err);
        reject(err);
      } else {
        console.log("Addresses1 stored successfully.");
        resolve();
      }
    });
  });
}
export default CreateAndDownloadSheet;
