const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const fs = require('fs');

const NOTES_FOLDER = "./notes/"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    res.append("Access-Control-Allow-Credentials", true);
    next();
});

app.get('/', (req, res) => res.send(getFiles()));

app.get('/getFiles', function(req, res, next) {
  let parsedFiles = [];

  let files = fs.readdirSync(NOTES_FOLDER);
  for(let i = 0; i < files.length; i++) {
    parsedFiles.push(parseFile(files[i]));
  }
  res.json(parsedFiles);
});

function parseFile(fileName) {
  var text = fs.readFileSync(NOTES_FOLDER+fileName,'utf8');
  let rows = text.split("\n");
  let tempCategories = rows[0].split(": ");
  tempCategories = tempCategories[1].split(", ");
  let categories = [];
  for(let i = 0; i < tempCategories.length; i++) {
    if (tempCategories[i] !== "") {
      categories.push(tempCategories[i]);
    }
  }
  let date = rows[1].split(": ");
  date = date[1];
  let content = rows[2];
  let nameElements = fileName.split(".");
  let title = nameElements[0];
  let extension = nameElements[nameElements.length-1];
  let isMarkdown = extension === "md";
  let fileObject = {title:title,content:content,categories:categories,isMarkdown:isMarkdown,date:date};
  return fileObject;
}

app.post('/saveFile', function(req, res, next) {
  if (!req.body.isNewFile) {
    deleteFile(req.body.deleteFile.title);
  }
  let file = req.body.file;
  const extension = file.isMarkdown ? ".md" : ".txt";
  const fileName = file.title+extension;
  const content = formatFileContent(file);
  fs.writeFile(NOTES_FOLDER+fileName, content, function(err) {
    if(err) {
      res.json({"status":"FILE SAVING FAILED"})
      return console.log(err);
    }
  });

  res.json({"status":"OK"});
});

function formatFileContent(file) {
  let content = "categories: ";
  const categories = file.categories;
  for (let i = 0; i < categories.length - 1; i++)
    content += categories[i] + ", ";
  if (categories && categories.length > 0)
    content += categories[categories.length-1];

  content += "\ndate: ";
  if ("date" in file) {
    content += (new Date(file.date)).toLocaleDateString();
  } else {
    content += (new Date()).toLocaleDateString();
  }
  content += "\n" + file.content;

  return content;
}

app.post('/deleteFile', function(req, res, next) {
  let fileTitle = req.body.title;
  deleteFile(fileTitle);

  res.json({"status":"OK"});
});

function deleteFile(fileTitle) {
  let fileNameMd = fileTitle + ".md";
  if (fs.existsSync(NOTES_FOLDER+fileNameMd)) {
    fs.unlink(NOTES_FOLDER+fileNameMd, (err) => {
      if (err) throw err;
    });
  } else {
    fs.unlink(NOTES_FOLDER+fileTitle+".txt", (err) => {
      if (err) throw err;
    });
  }
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
