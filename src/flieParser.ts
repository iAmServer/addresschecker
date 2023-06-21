import Excel from "exceljs";
import fs from "fs";

const getCellValue = (row: Excel.Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex);

  return cell.value ? cell.value.toString() : "";
};

const FileParse = async (filePath: string): Promise<string[]> => {
  const workbook = new Excel.Workbook();

  const content = await workbook.xlsx.readFile(filePath);
  const worksheet = content.worksheets[0];

  const rowStartIndex = 0;
  const numberOfRows = worksheet.rowCount;

  const rows = worksheet.getRows(rowStartIndex, numberOfRows) ?? [];

  const addresses = [
    ...new Set(
      rows.map((row): string => {
        return getCellValue(row, 1);
      })
    ),
  ];

  return addresses;
};

export const removeFile = (filePath: string) => {
  fs.unlinkSync(filePath);
};

export default FileParse;
