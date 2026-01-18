const submitForm = document.getElementById("submitForm");
const uploadForm = document.getElementById("uploadForm");

submitForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const type = document.getElementById("type").value;
  const phone = document.getElementById("phone").value;

  const res = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, phone })
  });

  const data = await res.json();
  document.getElementById("message").innerText = data.message + "\nYour User ID: " + data.id;
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("userId").value;
  const screenshot = document.getElementById("screenshot").value;

  const res = await fetch("/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, screenshot })
  });

  const data = await res.json();
  document.getElementById("uploadMessage").innerText = data.message;
});
