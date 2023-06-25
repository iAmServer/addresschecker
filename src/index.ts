import express, { Response } from "express";
import multer from "multer";
import {
  getMatchResultString,
  MatchAddresses,
  MatchAddresses2,
  quoteRemoval,
} from "./checker";
import CreateAndDownloadSheet from "./fileCreator";
import FileParse, { removeFile } from "./flieParser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));

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

          <label for="sheet1">Sheet 1:</label>
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

          <label for="addresses1">Addresses 1:</label>
          <textarea id="addresses1" name="addresses1" rows="5" required></textarea><br><br>

          <label for="addresses2">Addresses 2:</label>
          <textarea id="addresses2" name="addresses2" rows="5" required></textarea><br><br>
          
          <label for="addresses2">Export to excel? 
            <input type="checkbox" name="export" />
          </label><br><br>

          <input type="submit" value="Check Match">
        </form>

        <br /><br /><a href="/">Go Back</a>
      </body>
    </html>
  `);
});

app.post("/match", async (req, res) => {
  const addresses1: string = req.body.addresses1;
  const addresses2: string = req.body.addresses2;
  const exportOutput: boolean = req.body.export === "on";

  if (!addresses1 || !addresses2) {
    return res
      .status(400)
      .send(ErrorResponse("Both address fields are required"));
  }

  try {
    const parsedAddresses1 = addresses1.split("\n");
    const parsedAddresses2 = addresses2.split("\n");

    if (exportOutput) {
      FileOutput(parsedAddresses1, parsedAddresses2, res);
    } else {
      TableOutput(parsedAddresses1, parsedAddresses2, res);
    }
  } catch (error) {
    return res.status(500).send(ErrorResponse(error.message));
  }
});

app.post(
  "/match/file",
  upload.fields([
    { name: "sheet1", maxCount: 1 },
    { name: "sheet2", maxCount: 1 },
  ]),
  async (req, res) => {
    const exportOutput: boolean = req.body.export === "on";
    let sheet1Path: string | undefined;
    let sheet2Path: string | undefined;

    try {
      const files: { [fieldname: string]: Express.Multer.File[] } =
        req.files as any;

      sheet1Path = files.sheet1[0].path;
      sheet2Path = files.sheet2[0].path;

      if (!sheet1Path || !sheet2Path) {
        return res
          .status(400)
          .send(ErrorResponse("Both files are required for the script to run"));
      }

      const [parsedAddresses1, parsedAddresses2] = await Promise.allSettled([
        FileParse(sheet1Path),
        FileParse(sheet2Path),
      ]);

      if (
        parsedAddresses1.status === "rejected" ||
        parsedAddresses2.status === "rejected"
      ) {
        return res
          .status(400)
          .send(
            ErrorResponse(
              "We couldn't parse one or both files, please look into the uploaded file and try again"
            )
          );
      }

      if (exportOutput) {
        FileOutput(parsedAddresses1.value, parsedAddresses2.value, res);
      } else {
        TableOutput(parsedAddresses1.value, parsedAddresses2.value, res);
      }
    } catch (error) {
      res.status(500).send(ErrorResponse(error.message));
    } finally {
      if (sheet1Path) {
        removeFile(sheet1Path);
      }
      if (sheet2Path) {
        removeFile(sheet2Path);
      }
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const ErrorResponse = (error: string): string => {
  return `<html>
        <body>
          <h1>Address Matcher</h1>
          <p>Error: ${error}</p>
          <a href="/">Go Back</a>
        </body>
      </html>`;
};

const TableOutput = (
  parsedAddresses1: string[],
  parsedAddresses2: string[],
  res: Response
) => {
  if (parsedAddresses1.length !== parsedAddresses2.length) {
    return res
      .status(400)
      .send(
        ErrorResponse("The number of addresses in the fields is not equal")
      );
  }

  const output = MatchAddresses2(parsedAddresses1, parsedAddresses2);

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
              .map(
                ([address1, address2]) =>
                  address1 &&
                  address2 &&
                  `
                <tr>
                  <td>${address1}</td>
                  <td>${address2}</td>
                </tr>
              `
              )
              .join("")}
          </table>
          <a href="/">Go Back</a>
        </body>
      </html>
    `);
};

const FileOutput = (
  parsedAddresses1: string[],
  parsedAddresses2: string[],
  res: Response
) => {
  if (parsedAddresses1.length !== parsedAddresses2.length) {
    return res
      .status(500)
      .send(
        ErrorResponse(
          "The number of address in the files are not equal, please make sure they are before running the script"
        )
      );
  }

  const output = MatchAddresses2(parsedAddresses1, parsedAddresses2);
  // const output = Array.from(parsedAddresses1, (address1, i) => {
  //   address1 = quoteRemoval(address1);

  //   const address2 = quoteRemoval(parsedAddresses2[i]);

  //   if (address1 && address2) {
  //     return [
  //       address1,
  //       address2,
  //       getMatchResultString(MatchAddresses(address1, address2)),
  //     ];
  //   }
  // });

  CreateAndDownloadSheet(output, res, new Date().toDateString());
};
