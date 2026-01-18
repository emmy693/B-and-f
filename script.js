function send(){
  const f = new FormData();
  f.append("name", name.value);
  f.append("type", type.value);
  f.append("screenshot", shot.files[0]);

  fetch("/submit", { method:"POST", body:f })
    .then(r=>r.json())
    .then(d=>alert("Submitted. ID: "+d.id));
}