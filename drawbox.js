const GOOGLE_FORM_ID = "1FAIpQLSeX9Om6Wpaxin9X2MrWX_q336mqdYN9py0IhMzccI-ORbUvnA";
const ENTRY_ID = "entry.927975880";
const GOOGLE_SHEET_ID = "1h9xmNff5B318N9-5XR2YbQV0VGBgp5OqPvxjnG-mPVc";
const DISPLAY_IMAGES = true; 

const CLIENT_ID = "b4fb95e0edc434c"; 
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv&gid=435392140`;
const GOOGLE_FORM_URL = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;

let canvas = document.getElementById("drawboxcanvas");
let context = canvas.getContext("2d", { willReadFrequently: true });

context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

let restore_array = [];
let start_index = -1;

let stroke_color = "#5D536B";  
let stroke_width = 4;     
let is_drawing = false;


function start(event) {
  if (pickingCanvasColor) {
    pickColorFromCanvas(event);
    event.preventDefault();
    return;
  }

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

const colorArea = document.getElementById("colorArea");
const huePicker = document.getElementById("huePicker");
const colorContext = colorArea.getContext("2d");

let selectedHue = 330;

function drawColorArea() {
  const hueColor = `hsl(${selectedHue}, 100%, 50%)`;

  colorContext.fillStyle = hueColor;
  colorContext.fillRect(0, 0, colorArea.width, colorArea.height);

  const whiteGradient = colorContext.createLinearGradient(0, 0, colorArea.width, 0);
  whiteGradient.addColorStop(0, "#fff");
  whiteGradient.addColorStop(1, "transparent");
  colorContext.fillStyle = whiteGradient;
  colorContext.fillRect(0, 0, colorArea.width, colorArea.height);

  const blackGradient = colorContext.createLinearGradient(
  0, 0, 0, colorArea.height
);

blackGradient.addColorStop(0, "transparent");
blackGradient.addColorStop(1, "#000");

colorContext.fillStyle = blackGradient;
colorContext.fillRect(0, 0, colorArea.width, colorArea.height);
}

function hsvToHsl(h, s, v) {
  s /= 100;
  v /= 100;

  const lightness = v * (1 - s / 2);
  const hslS =
    lightness === 0 || lightness === 1
      ? 0
      : (v - lightness) / Math.min(lightness, 1 - lightness);

  return {
    h,
    s: hslS * 100,
    l: lightness * 100
  };
}

function updateColor(event) {
  const rect = colorArea.getBoundingClientRect();

  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));

  const saturation = (x / rect.width) * 100;
  const value = 100 - (y / rect.height) * 100;

  const color = hsvToHsl(selectedHue, saturation, value);
  stroke_color = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

  colorPickerButton.style.backgroundColor = stroke_color;
}

colorArea.addEventListener("pointerdown", (event) => {
  colorArea.setPointerCapture(event.pointerId);
  updateColor(event);
});

colorArea.addEventListener("pointermove", (event) => {
  if (event.buttons) updateColor(event);
});

huePicker.addEventListener("input", () => {
  selectedHue = huePicker.value;
  drawColorArea();
});
const colorPickerButton = document.getElementById("colorPickerButton");
const colorPickerPopup = document.getElementById("colorPickerPopup");

colorPickerButton.addEventListener("click", (event) => {
  event.stopPropagation();
  colorPickerPopup.hidden = !colorPickerPopup.hidden;
});

colorPickerPopup.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", () => {
  colorPickerPopup.hidden = true;
});

const pickCanvasColor = document.getElementById("pickCanvasColor");
let pickingCanvasColor = false;

if (pickCanvasColor) {
  pickCanvasColor.addEventListener("click", (event) => {
    event.stopPropagation();
    pickingCanvasColor = true;
    colorPickerPopup.hidden = true;
    document.getElementById("status").textContent =
      "Click a colour on your drawing.";
  });
}

function rgbToHex(red, green, blue) {
  return "#" + [red, green, blue]
    .map(value => value.toString(16).padStart(2, "0"))
    .join("");
}

function pickColorFromCanvas(event) {
  const x = Math.floor(getX(event));
  const y = Math.floor(getY(event));
  const pixel = context.getImageData(x, y, 1, 1).data;

  stroke_color = rgbToHex(pixel[0], pixel[1], pixel[2]);
  colorPickerButton.style.backgroundColor = stroke_color;
  document.getElementById("status").textContent = "";
  pickingCanvasColor = false;
}
drawColorArea();

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
  const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
  return (clientX - rect.left) * (canvas.width / rect.width);
}

function getY(event) {
  const rect = canvas.getBoundingClientRect();
  const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;
  return (clientY - rect.top) * (canvas.height / rect.height);
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


document.getElementById("submit").addEventListener("click", async function () {
  const submitButton = document.getElementById("submit");
  const statusText = document.getElementById("status");

  submitButton.disabled = true;
  statusText.textContent = "Uploading...";

  try {
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    const formData = new FormData();
    formData.append("image", blob, "drawing.png");

    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
        Accept: "application/json"
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.data?.error || "Imgur upload failed");
    }

const googleForm = document.createElement("form");
googleForm.method = "POST";
googleForm.action = GOOGLE_FORM_URL;
googleForm.target = "google-form-frame";
googleForm.style.display = "none";

const imageField = document.createElement("input");
imageField.type = "hidden";
imageField.name = ENTRY_ID;
imageField.value = data.data.link;

googleForm.appendChild(imageField);
document.body.appendChild(googleForm);
googleForm.submit();

await new Promise(resolve => setTimeout(resolve, 1000));
googleForm.remove();

    statusText.textContent = "Upload successful!";
    alert("Image uploaded!");
    location.reload();
  } catch (error) {
    console.error("Upload error:", error);
    statusText.textContent = "Error uploading.";
    alert(`Upload failed: ${error.message}`);
  } finally {
    submitButton.disabled = false;
  }
});

async function fetchImages() {
  if (!DISPLAY_IMAGES) return;
  try {
    const response = await fetch(GOOGLE_SHEET_URL);
    const csvText = await response.text();
    
    const rows = csvText.split(/\r?\n/).slice(1);
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
