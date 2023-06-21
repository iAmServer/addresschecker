import express from "express";
import multer from "multer";
import ProcessAddressMatching from "./checker";

const app = express();
const port = 3000;
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
  upload.fields([
    { name: "sheet1", maxCount: 1 },
    { name: "sheet2", maxCount: 1 },
  ]),
  ProcessAddressMatching
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
