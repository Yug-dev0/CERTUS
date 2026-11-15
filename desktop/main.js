const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let apiProcess = null;
let frontendProcess = null;
let ollamaProcess = null;

const ROOT_DIR = path.resolve(__dirname, '..');
const API_URL = 'http://127.0.0.1:8000';
const WEB_URL = 'http://localhost:3000';
const OLLAMA_URL = 'http://127.0.0.1:11434';

function isServiceAlive(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = http.request(
        {
          host: u.hostname,
          port: u.port,
          path: u.pathname,
          method: 'GET',
          timeout: timeoutMs,
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

async function waitForService(url, maxTries = 35, intervalMs = 1000) {
  for (let i = 0; i < maxTries; i++) {
    if (await isServiceAlive(url)) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

async function ensureOllamaRunning() {
  const alive = await isServiceAlive(`${OLLAMA_URL}/api/tags`);
  if (alive) return true;

  console.log('[CERTUS] Starting local Ollama engine...');
  try {
    const startScript = path.join(ROOT_DIR, 'scripts', 'start-ollama.sh');
    if (process.platform !== 'win32' && fs.existsSync(startScript)) {
      ollamaProcess = spawn(startScript, ['--tier', 'laptop-16gb'], {
        detached: true,
        stdio: 'ignore',
        cwd: ROOT_DIR,
      });
    } else {
      ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore',
      });
    }
    ollamaProcess.unref();
  } catch (err) {
    console.warn('[CERTUS] Note: could not auto-spawn ollama:', err.message);
  }

  return await waitForService(`${OLLAMA_URL}/api/tags`, 12, 1000);
}

async function ensureBackendRunning() {
  const alive = await isServiceAlive(`${API_URL}/api/ready`);
  if (alive) return true;

  console.log('[CERTUS] Starting FastAPI backend on 127.0.0.1:8000...');
  const venvPython = path.join(ROOT_DIR, '.venv', 'bin', 'python');
  const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

  apiProcess = spawn(
    pythonCmd,
    [
      '-m',
      'uvicorn',
      'backend.api.main:app',
      '--host',
      '127.0.0.1',
      '--port',
      '8000',
      '--timeout-keep-alive',
      '75',
    ],
    {
      cwd: ROOT_DIR,
      env: { ...process.env, SOVEREIGN_PROFILE: 'laptop-16gb' },
      stdio: 'ignore',
      detached: process.platform !== 'win32',
    }
  );

  return await waitForService(`${API_URL}/api/ready`, 25, 1000);
}

async function ensureFrontendRunning() {
  const alive = await isServiceAlive(`${WEB_URL}/`);
  if (alive) return true;

  console.log('[CERTUS] Starting Next.js frontend on 127.0.0.1:3000...');
  frontendProcess = spawn(
    'npx',
    ['next', 'start', '-H', '127.0.0.1', '-p', '3000'],
    {
      cwd: path.join(ROOT_DIR, 'frontend'),
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'ignore',
      detached: process.platform !== 'win32',
    }
  );

  return await waitForService(`${WEB_URL}/`, 25, 1000);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: 'CERTUS — Sovereign Industrial AI Workbench',
    backgroundColor: '#070707',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 22 },
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(ROOT_DIR, 'docs', 'assets', 'brand', 'certus-app-icon.icns'),
  });

  // Inject macOS titlebar clearance & window drag styles
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.insertCSS(`
      /* macOS desktop frameless titlebar clearance */
      .hv-auth > header {
        padding-left: 96px !important;
        -webkit-app-region: drag;
      }
      .hv-auth > header a,
      .hv-auth > header button {
        -webkit-app-region: no-drag;
      }
      .lp-header .lp-shell.row {
        padding-left: 96px !important;
        -webkit-app-region: drag;
      }
      .lp-header .lp-shell.row a,
      .lp-header .lp-shell.row button {
        -webkit-app-region: no-drag;
      }
      aside[aria-label="Workbench"] {
        padding-top: 42px !important;
      }
      aside[aria-label="Workbench"] > div:first-child {
        -webkit-app-region: drag;
      }
      aside[aria-label="Workbench"] a,
      aside[aria-label="Workbench"] button,
      aside[aria-label="Workbench"] input {
        -webkit-app-region: no-drag;
      }
    `);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links safely in system browser
    if (url.startsWith('http:') || url.startsWith('https:')) {
      if (!url.includes('127.0.0.1') && !url.includes('localhost')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
    }
    return { action: 'allow' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL(WEB_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function stopSpawnedProcesses() {
  if (apiProcess && !apiProcess.killed) {
    try {
      process.kill(-apiProcess.pid);
    } catch {
      apiProcess.kill();
    }
  }
  if (frontendProcess && !frontendProcess.killed) {
    try {
      process.kill(-frontendProcess.pid);
    } catch {
      frontendProcess.kill();
    }
  }
}

app.whenReady().then(async () => {
  // Start or connect services in parallel
  await Promise.all([
    ensureOllamaRunning(),
    ensureBackendRunning(),
    ensureFrontendRunning(),
  ]);

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopSpawnedProcesses();
});

app.on('will-quit', () => {
  stopSpawnedProcesses();
});
