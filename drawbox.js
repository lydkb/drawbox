const GOOGLE_FORM_ID = "1FAIpQLSer07GoDctcl7Y4Kp4H-mFe6AJvh4yG-_ywXzySv_Up2siKeg";
const ENTRY_ID = "entry.1218245555";
const GOOGLE_SHEET_ID = "1h9xmNff5B318N9-5XR2YbQV0VGBgp5OqPvxjnG-mPVc";
const DISPLAY_IMAGES = true; 

const CLIENT_ID = "b4fb95e0edc434c"; 
const GOOGLE_SHEET_URL = `https://google.com{GOOGLE_SHEET_ID}/export?format=csv`;
const GOOGLE_FORM_URL = `https://google.com{GOOGLE_FORM_ID}/formResponse`;

let canvas = document.getElementById("drawboxcanvas");
let context = canvas.getContext("2d");

context.fillStyle = "white";        
context.fillRect(0, 0, canvas.width, canvas.height);

let restore_array = [];
let start_index = -1;

let stroke_color = "#5D536B";  
let stroke_width = 4;     
let is_drawing = false;

function start(event) {
  is_drawing = true;
  context.beginPath();
  context.moveTo(getX(event), getY(event));
  event.preventDefault();
}

function draw(event) {
  if (!is_drawing) return;
  context.lineTo(getX(event), getY(event));
  context.strokeStyle = stroke_color;
  context.lineWidth = stroke_width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
  event.preventDefault();
}

document.getElementById("brushSize").addEventListener("input", function () {
  stroke_width = this.value;
});

document.getElementById("colorPicker").addEventListener("input", function () {
  stroke_color = this.value;
});

function stop(event) {
  if (!is_drawing) return;
  context.stroke();
  context.closePath();
  is_drawing = false;
  restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
  start_index++;
  event.preventDefault();
}

function getX(event) {
  const rect = canvas.getBoundingClientRect();
  return (event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : 0)) - rect.left;
}

function getY(event) {
  const rect = canvas.getBoundingClientRect();
  return (event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : 0)) - rect.top;
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mouseout", stop);

canvas.addEventListener("touchstart", start, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stop, { passive: false });

function Restore() {
  if (start_index <= 0) {
    Clear();
  } else {
    start_index--;
    restore_array.pop();
    context.putImageData(restore_array[start_index], 0, 0);
  }
}

function Clear() {
  context.fillStyle = "white";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillRect(0, 0, canvas.width, canvas.height);
  restore_array = [];
  start_index = -1;
}

document.getElementById("undoBtn").addEventListener("click", Restore);
document.getElementById("clearBtn").addEventListener("click", Clear);

document.getElementById("submit").addEventListener("click", async function () {
  const submitButton = document.getElementById("submit");
  const statusText = document.getElementById("status");

  submitButton.disabled = true;
  statusText.textContent = "Uploading...";

  const imageData = canvas.toDataURL("image/png");

  const imgurFormData = new FormData();
  imgurFormData.append("image", imageData.split(',')[1]);
  imgurFormData.append("type", "base64");

  try {
    const response = await fetch("https://imgur.com", {
      method: "POST",
      headers: { Authorization: `Client-ID ${CLIENT_ID}` },
      body: imgurFormData, 
    });

    const data = await response.json();
    if (!data.success) throw new Error("Imgur upload failed");

    const imageUrl = data.data.link;

    const googleFormData = new FormData();
    googleFormData.append(ENTRY_ID, imageUrl);

    await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      body: googleFormData,
      mode: "no-cors", 
    });

    statusText.textContent = "Upload successful!";
    alert("Image uploaded!");
    location.reload();

  } catch (error) {
    console.error(error);
    statusText.textContent = "Error uploading.";
    alert("Upload failed. Check your browser console for details.");
  } finally {
    submitButton.disabled = false;
  }
});

async function fetchImages() {
  if (!DISPLAY_IMAGES) return;
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvText = await response.text();
    
    const rows = csvText.split("\n").slice(1);
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    rows.reverse().forEach((row) => {
      const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (columns.length < 2) return;
      
      const timestamp = columns[0].trim().replace(/"/g, "");
      const imgUrl = columns[1].trim().replace(/"/g, "");

      if (imgUrl.startsWith("http")) {
        const div = document.createElement("div");
        div.classList.add("image-container");
        div.innerHTML = `<img src="${imgUrl}" alt="drawing"><p>${timestamp}</p>`;
        gallery.appendChild(div);
      }
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    document.getElementById("gallery").textContent = "Failed to load images.";
  }
}
fetchImages();
