const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// make sure folders exist
const uploadsDir = path.join(__dirname, "uploads");
const sitesDir = path.join(__dirname, "sites");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(sitesDir)) fs.mkdirSync(sitesDir);

// load users
const usersFile = path.join(__dirname, "users.json");
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));

// helper to read/write users
function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}
function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Serve frontend static files
app.use(express.static("frontend"));

// Root route fix (important for Render)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// submit website request
app.post("/submit", (req, res) => {
  const { name, type, phone } = req.body;

  if (!name || !type || !phone) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const users = readUsers();
  const id = Date.now().toString();
  users.push({
    id,
    name,
    type,
    phone,
    status: "pending",
    screenshot: "",
  });

  writeUsers(users);
  res.json({ message: "Request submitted", id });
});

// upload screenshot (manual payment)
app.post("/upload", (req, res) => {
  const { id, screenshot } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.id === id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.screenshot = screenshot;
  writeUsers(users);
  res.json({ message: "Screenshot uploaded" });
});

// admin login (simple password)
app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === "mine1234$$") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

// admin list users
app.get("/admin/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

// approve user
app.post("/admin/approve", (req, res) => {
  const { id } = req.body;
  const users = readUsers();
  const user = users.find((u) => u.id === id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.status = "approved";
  writeUsers(users);

  // generate website
  const sitePath = path.join(sitesDir, id);
  if (!fs.existsSync(sitePath)) fs.mkdirSync(sitePath);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${user.name}</title>
    <style>
      body { font-family: Arial; padding: 20px; }
    </style>
  </head>
  <body>
    <h1>${user.name}</h1>
    <p>Type: ${user.type}</p>
    <p>Phone: ${user.phone}</p>
    <p>Status: Approved</p>
  </body>
  </html>
  `;

  fs.writeFileSync(path.join(sitePath, "index.html"), html);

  res.json({ message: "Approved & published" });
});

// serve generated sites
app.get("/site/:id", (req, res) => {
  const sitePath = path.join(sitesDir, req.params.id, "index.html");
  if (!fs.existsSync(sitePath)) {
    return res.status(404).send("Site not found");
  }
  res.sendFile(sitePath);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
