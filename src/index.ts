import express, { NextFunction, Response } from "express";
import multer from "multer";
import { compareArrays } from "./checker";
import CreateAndDownloadSheet, { storeAddresses } from "./fileCreator";
import FileParse, { removeFile, retrieveAddresses } from "./flieParser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const authenticate = (req: any, res: Response, next: NextFunction) => {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;
  const session = req["signedCookies"].session;

  if (req.method === "GET" && session === "authenticated") {
    return next();
  }

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (!(username === "godaisy2023" && password === "godaisy2023")) {
    return reject();
  }

  res.cookie("session", "authenticated", {
    signed: true,
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  });

  next();
};

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("w35rqwbt435qg6yg2qd45yjhwes5d"));
app.use(authenticate);

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

          <label for="useOldStoreAddresses">Use Stored Addressess for Addresses 1:</label>
          <input type="checkbox" id="useOldStoreAddresses" name="useOldStoreAddresses"><br /><br />

          <p>NB: For every new Addressess 1 it overrides the stored addresses on the system</p>

          <div id="addresses1Container">
            <label for="sheet1">Sheet 1 <i>This is the main file</i>:</label>
            <input type="file" id="sheet1" name="sheet1" required accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" /><br><br>
          </div>

          <label for="sheet2">Sheet 2:</label>
          <input type="file" id="sheet2" name="sheet2" required accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" /><br><br>

          <label for="addresses2">Export to excel? 
            <input type="checkbox" name="export" />
          </label><br><br>

          <input type="submit" value="Check Match">
        </form>
        <br /><br /><a href="/">Go Back</a>
      </body>

       <script>
          const useOldStoreAddressCheckbox = document.getElementById("useOldStoreAddresses");
          const addresses1Container = document.getElementById("addresses1Container");
          const sheet1 = document.getElementById("sheet1");

          useOldStoreAddressCheckbox.addEventListener("change", function() {
            addresses1Container.style.display = this.checked ? "none" : "block";
            sheet1.disabled = this.checked;
            if (this.checked) {
              sheet1.removeAttribute("required");
            } else {
              sheet1.setAttribute("required", "required");
            }
          });
        </script>
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

          <p>NB: For every new Addressess 1 it overrides the stored addresses on the system</p>

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

        
        <br /><br /><a href="/">Go Back</a>
        </body>

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
    </html>
  `);
});

app.post("/match", async (req, res) => {
  const addresses1: string = req.body.addresses1;
  const addresses2: string = req.body.addresses2;
  const useOldStoreAddresses: boolean =
    req.body.useOldStoreAddresses === "on" ? true : false;
  const exportOutput: boolean = req.body.export === "on" ? true : false;

  if ((!addresses1 || !useOldStoreAddresses) && !addresses2) {
    return res
      .status(400)
      .send(ErrorResponse("Both address fields are required"));
  }

  try {
    let parsedAddresses1: string[] = [];
    const parsedAddresses2 = addresses2.split("\r\n");
    const storedAddresses = await retrieveAddresses();

    if (useOldStoreAddresses && !storedAddresses) {
      return res
        .status(400)
        .send(
          ErrorResponse("There's currently no stored address on the system")
        );
    }

    parsedAddresses1 = storedAddresses.split("\r\n");

    if (useOldStoreAddresses === false) {
      await storeAddresses(addresses1);
      parsedAddresses1 = addresses1.split("\r\n");
    }

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
    const useOldStoreAddresses: boolean =
      req.body.useOldStoreAddresses === "on" ? true : false;
    const exportOutput: boolean = req.body.export === "on" ? true : false;
    let sheet1Path: string | undefined;
    let sheet2Path: string | undefined;

    try {
      const files: { [fieldname: string]: Express.Multer.File[] } =
        req.files as any;

      sheet1Path =
        files.sheet1 && files.sheet1.length > 0 && files.sheet1[0].path;
      sheet2Path = files.sheet2[0].path;

      if ((!sheet1Path || !useOldStoreAddresses) && !sheet2Path) {
        return res
          .status(400)
          .send(ErrorResponse("Both files are required for the script to run"));
      }

      let parsedAddresses1: string[] = [];
      let parsedAddresses2: string[] = [];

      if (useOldStoreAddresses) {
        const storedAddresses = await retrieveAddresses();

        if (!storedAddresses) {
          return res
            .status(400)
            .send(
              ErrorResponse("There's currently no stored address on the system")
            );
        }
        parsedAddresses1 = storedAddresses.split("\r\n");
      } else {
        const parsedSheet1 = await FileParse(sheet1Path);
        if (!parsedSheet1) {
          return res
            .status(400)
            .send(
              ErrorResponse(
                "We couldn't parse the first file, please look into the uploaded file and try again"
              )
            );
        }

        parsedAddresses1 = parsedSheet1;
        await storeAddresses(parsedSheet1.join("\r\n"));
      }

      const parsedSheet2 = await FileParse(sheet2Path);
      if (!parsedSheet2) {
        return res
          .status(400)
          .send(
            ErrorResponse(
              "We couldn't parse the second file, please look into the uploaded file and try again"
            )
          );
      }
      parsedAddresses2 = parsedSheet2;

      if (exportOutput) {
        FileOutput(parsedAddresses1, parsedAddresses2, res);
      } else {
        TableOutput(parsedAddresses1, parsedAddresses2, res);
      }
    } catch (error) {
      console.log(error);
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
        <head>
          <title>Address Matcher - Error</title>
        </head>
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
  const output = compareArrays(parsedAddresses1, parsedAddresses2);

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
                ([address1, address2, output]) =>
                  address1 &&
                  address2 &&
                  output &&
                  `
                <tr>
                  <td>${address1}</td>
                  <td>${address2}</td>
                  <td>${output}</td>
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
  const output = compareArrays(parsedAddresses1, parsedAddresses2);

  CreateAndDownloadSheet(output, res, new Date().toDateString());
};
