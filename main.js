const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const { Client } = require("whatsapp-web.js-cloned-fixed");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

let client;

// Main Window
function createmainWindowdow() {
  mainWindow = new BrowserWindow({
    title: "Test whatsapp",
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Show devtools automatically if in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: "About Test whatsapp",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// App is ready
app.whenReady().then(() => {
  createmainWindowdow();

  // Implement Menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove variable from memory
  mainWindow.on("closed", () => (mainWindow = null));

  // Open a window if none are open (macOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createmainWindowdow();
    }
  });
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: "Developer",
          submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { type: "separator" },
            { role: "toggledevtools" },
          ],
        },
      ]
    : []),
  {
    label: "Keyboard Access",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:",
      },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:",
      },
    ],
  },
];

// Respond to the "create-whatsapp-web-client" event
ipcMain.on("create-whatsapp-web-client", (e, options) => {
  // console.log("e", e);
  console.log("options", options);

  client = new Client();
  console.log("client ", client);
  console.log("client info", client.info);

  client.on("qr", (qr) => {
    console.log("qr", qr);

    // Send success to renderer
    mainWindow.webContents.send("qr", qr);
  });

  client.on("loading_screen", (percent, message) => {
    console.log("loading_screen", percent, message);

    // Send message to renderer
    mainWindow.webContents.send("loading_screen", { percent, message });
  });

  client.on("authenticated", () => {
    console.log("authenticated");

    // Send message to renderer
    mainWindow.webContents.send("authenticated");
  });

  client.on("auth_failure", (msg) => {
    console.log("auth_failure", msg);

    // Send message to renderer
    mainWindow.webContents.send("auth_failure", msg);
  });

  client.on("ready", () => {
    console.log("ready");

    // Send message to renderer
    mainWindow.webContents.send("ready");

    // client.sendMessage("919619803472@s.whatsapp.net", "message");
  });

  client.initialize();
});

// Handle page navigation
ipcMain.on("navigate-to-screen", (e, filePath) => {
  console.log("navigate-to-screen", filePath);
  mainWindow.loadFile(path.join(__dirname, `./renderer/${filePath}`));
});

// Handle sending whatsapp text message
ipcMain.on("send-whatsapp-text-message", (e, data) => {
  console.log("send-whatsapp-text-message", data);
  const { mobile, message } = JSON.parse(data);
  client.sendMessage(mobile, message);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

// npx electronmon .
