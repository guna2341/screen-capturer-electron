
const { app, BrowserWindow, ipcMain, screen, desktopCapturer, Tray } = require("electron");

// get path
const path = require("path");

const fs = require("fs");

const os = require("os");

function createWindow() {
    const win = new BrowserWindow({
        title: "Camera capturer",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        },
        frame: false,
        transparent: true,
        show: true
    })
    const iconPath = path.join(__dirname, "assets/camera.ico");
    const tray = new Tray(iconPath);    
    tray.on("click", () => {
        if (win.isVisible()) {
            win.hide();
        }
        else {
            win.show();
        }
    });
    win.setIcon(iconPath);
    win.loadFile(path.join(__dirname, "index.html"));

    ipcMain.on("close", () => {
        win.close();
    });

    ipcMain.on("capture-screen", async () => {
        win.hide();
        const screenSize = screen.getPrimaryDisplay().workAreaSize;
        const screens = await desktopCapturer.getSources({
            types: ["screen"],
            thumbnailSize: {
                width: screenSize.width,
                height: screenSize.height
            }
        });
        try {
        const img = screens[0].thumbnail.toPNG();
        const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timeStamp}.png`;
        const filePath = path.join(os.homedir(),"desktop", filename);
        fs.writeFile(filePath, img, (err) => {
                console.log(err);
        })
    }
    finally {
        win.show();
    }
    });

}

app.whenReady().then(createWindow);