const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const imageUpload = document.getElementById("image-upload");

// --- SEND TEXT MESSAGE ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  const thinkingBubble = appendMessage("bot", "Thinking…");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation: [{ role: "user", text: userMessage }]
      })
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

    thinkingBubble.textContent = data?.result || "No response received.";

  } catch (error) {
    thinkingBubble.textContent = "Failed to get response from server.";
  }
});

// --- SEND IMAGE ---
imageUpload.addEventListener("change", async () => {
  const file = imageUpload.files[0];
  if (!file) return;

  // Preview ke chat
  //const imgURL = URL.createObjectURL(file);
  appendImage("user", file);

  const thinkingBubble = appendMessage("bot", "Thinking…");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("conversation", JSON.stringify([{ role: "user", text: "Image uploaded" }]));

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    thinkingBubble.textContent = data?.result || "No response received.";

  } catch (error) {
    thinkingBubble.textContent = "Failed to send image.";
  }

  imageUpload.value = "";
});

// --- Helpers ---
function appendMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function appendImage_lama(role, imgURL) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  const img = document.createElement("img");
  img.src = imgURL;
  img.style.maxWidth = "180px";
  img.style.borderRadius = "14px";
  img.style.margin = "6px 0";

  msg.appendChild(img);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  return msg;


}

function appendImage(role, file) {
  const msg = document.createElement("div");
  msg.className = `message ${role}`;

  //const ext = file.name.split('.').pop().toLowerCase();
  const imageExt = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const pdfExt   = ["pdf"];
  const audioExt = ["mp3", "wav", "ogg", "m4a"];
  const docExt   = ["doc", "docx"];

  // Jika file adalah gambar → tampilkan preview
   if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "180px";
    img.style.borderRadius = "14px";
    img.style.margin = "6px 0";

    msg.appendChild(img);
  } else {
    // Untuk non-image → tampilkan icon + nama file
    const fileBox = document.createElement("div");
    fileBox.style.display = "flex";
    fileBox.style.alignItems = "center";
    fileBox.style.gap = "10px";

    const icon = document.createElement("span");
    icon.style.fontSize = "22px";

    if (file.type.includes("pdf")) icon.textContent = "📄";
    else if (file.type.includes("audio")) icon.textContent = "🎵";
    else if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx"))
      icon.textContent = "📘";
    else icon.textContent = "📎";

    const name = document.createElement("span");
    name.textContent = file.name;

    fileBox.appendChild(icon);
    fileBox.appendChild(name);

    msg.appendChild(fileBox);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  return msg;
}