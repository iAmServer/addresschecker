import express from "express";
import multer from "multer";
import { getMatchResultString, MatchAddresses, quoteRemoval } from "./checker";
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
        <form method="POST" action="/match" enctype="multipart/form-data">
          <label for="sheet1">Sheet 1:</label>
          <input type="file" id="sheet1" name="sheet1" required><br><br>
          <label for="sheet2">Sheet 2:</label>
          <input type="file" id="sheet2" name="sheet2" required><br><br>
          <input type="submit" value="Check Match">
        </form>
      </body>
    </html>
  `);
});

app.post(
  "/match",
  // upload.array("files"),
  upload.fields([
    { name: "sheet1", maxCount: 1 },
    { name: "sheet2", maxCount: 1 },
  ]),
  async (req, res) => {
    let sheet1Path, sheet2Path;

    try {
      const files: { [fieldname: string]: Express.Multer.File[] } =
        req.files as any;

      sheet1Path = files.sheet1[0].path;
      sheet2Path = files.sheet2[0].path;

      if (!sheet1Path || !sheet2Path) {
        return res
          .status(500)
          .send(ErrorResponse("Both files are required for the script to run"));
      }

      const [parsedAddresses1, parsedAddresses2] = await Promise.all([
        FileParse(sheet1Path),
        FileParse(sheet2Path),
      ]);

      if (parsedAddresses1.length !== parsedAddresses2.length) {
        return res
          .status(500)
          .send(
            ErrorResponse(
              "The number of address in the files are not equal, please make sure they are before running the script"
            )
          );
      }

      const output = Array.from(parsedAddresses1, (address1, i) => {
        address1 = quoteRemoval(address1);

        const address2 = quoteRemoval(parsedAddresses2[i]);

        if (address1 && address2) {
          return [
            address1,
            address2,
            getMatchResultString(MatchAddresses(address1, address2)),
          ];
        }
      });

      CreateAndDownloadSheet(output, res, new Date().toDateString());
    } catch (error) {
      res.status(500).send(ErrorResponse(error.message));
    } finally {
      removeFile(sheet1Path);
      removeFile(sheet2Path);
    }
  }
);

console.log(
  `150 Washington Avenue vs 150 Washington Ave ${
    MatchAddresses("150 Washington Avenue", "150 Washington Ave")
      ? "Matches"
      : "Does not match"
  }`
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
