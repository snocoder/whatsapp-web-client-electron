const qrCodeContainer = document.getElementById("qr-code");
const qrCodeLoaderContainer = document.getElementById("qr-loader");
const qrStatusContainer = document.getElementById("qr-status");

function createWhatsappWebClient() {
  console.log("whatsapp client initialize function called");

  qrCodeContainer.style.display = "none";
  ipcRenderer.send("create-whatsapp-web-client");
}
// When qr received
ipcRenderer.on("qr", async (qr) => {
  console.log("qr ", qr);

  //   disbale loader
  qrCodeLoaderContainer.style.display = "none";

  //   append qr code
  var canvas = document.createElement("canvas");
  QRCode.toCanvas(canvas, qr);
  qrCodeContainer.style.display = "block";
  qrCodeContainer.appendChild(canvas);

  //   change qr status
  qrStatusContainer.innerText = "QR is loaded. Pls scan the qr now to proceed.";
});

ipcRenderer.on("loading_screen", ({ percent, message }) => {
  qrStatusContainer.innerText = `Loading in progress, ${percent} % done.`;
});

ipcRenderer.on("authenticated", () => {
  qrStatusContainer.innerText = "authenticated"
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

ipcRenderer.on("auth_failure", (msg) => {
  qrStatusContainer.innerText = `Authentication failed:: ${msg}`;
});

ipcRenderer.on("ready", () => {
  qrStatusContainer.innerText = "ready"
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  ipcRenderer.send("navigate-to-screen", "send-whatsapp.html");
});
