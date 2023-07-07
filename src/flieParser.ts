import { Workbook, Row } from "exceljs";
import fs from "fs";

const getCellValue = (row: Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex);

  return cell.value ? cell.value.toString() : "";
};

const FileParse = async (filePath: string): Promise<string[]> => {
  const workbook = new Workbook();
  const content = await workbook.xlsx.readFile(filePath);
  const worksheet = content.worksheets[0];

  const rowStartIndex = 1;
  const numberOfRows = worksheet.rowCount;

  const rows = worksheet.getRows(rowStartIndex, numberOfRows + 1) ?? [];

  const addresses = [
    ...new Set(
      rows.map((row): string => {
        return getCellValue(row, 1);
      })
    ),
  ];

  return addresses;
};

export async function retrieveAddresses(): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile("addresses.txt", "utf8", (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve("");
        } else {
          reject(err);
        }
      } else {
        resolve(data.toString());
      }
    });
  });
}

export const removeFile = (filePath: string) => {
  fs.unlinkSync(filePath);
};

export default FileParse;
