const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const ADMIN_PASSWORD = "mine1234$$";
const USERS_FILE = "users.json";
const SITES_FOLDER = "sites";

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(SITES_FOLDER)) fs.mkdirSync(SITES_FOLDER);

app.use(express.static("frontend"));

app.post("/submit", upload.single("screenshot"), (req, res) => {
  const { name, type } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  const user = {
    id: Date.now(),
    name,
    type,
    screenshot: req.file?.filename || null,
    approved: false,
    published: false,
    siteId: null
  };

  users.push(user);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true, id: user.id });
});

app.post("/admin", (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/users", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(USERS_FILE)));
});

app.post("/approve", (req, res) => {
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.id == req.body.id);

  if (!user) return res.json({ error: "User not found" });

  user.approved = true;
  user.siteId = "site-" + user.id;

  const html = `
<!DOCTYPE html>
<html>
<head>
<title>${user.name}</title>
<meta charset="UTF-8">
<style>
body{font-family:Arial;padding:20px}
h1{color:#4f46e5}
</style>
</head>
<body>
<h1>${user.name}</h1>
<p>Business Type: ${user.type}</p>
<p>Website generated automatically.</p>
</body>
</html>
`;

  fs.writeFileSync(`${SITES_FOLDER}/${user.siteId}.html`, html);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true, link: `/site/${user.siteId}` });
});

app.get("/site/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "sites", `${req.params.id}.html`));
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);