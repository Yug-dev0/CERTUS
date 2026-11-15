const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let apiProcess = null;
let frontendProcess = null;
let ollamaProcess = null;

const API_URL = 'http://127.0.0.1:8000';
const WEB_URL = 'http://localhost:3000';
const OLLAMA_URL = 'http://127.0.0.1:11434';

/**
 * Dynamically locate the CERTUS project root directory across development,
 * packaged .app bundles, and standard user directories.
 */
function findRootDir() {
  const candidates = [
    process.env.CERTUS_ROOT,
    path.resolve(__dirname, '..'), // When running from repo desktop/
    path.resolve(__dirname, '../../..'), // When running inside .app/Contents/Resources/app
    path.join(app.getPath('home'), 'CERTUS'), // Standard location ~/CERTUS
    path.join(app.getPath('home'), 'Desktop', 'CERTUS'),
    path.join(app.getPath('home'), 'Documents', 'CERTUS'),
    path.join(app.getPath('home'), 'Downloads', 'CERTUS'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (
      fs.existsSync(candidate) &&
      fs.existsSync(path.join(candidate, 'frontend', 'package.json'))
    ) {
      return candidate;
    }
  }

  return path.resolve(__dirname, '..');
}

const ROOT_DIR = findRootDir();

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
    ollamaProcess.on('error', (err) => {
      console.warn('[CERTUS] Ollama spawn notice:', err.message);
    });
    if (ollamaProcess.unref) ollamaProcess.unref();
  } catch (err) {
    console.warn('[CERTUS] Note: could not auto-spawn ollama:', err.message);
  }

  return await waitForService(`${OLLAMA_URL}/api/tags`, 12, 1000);
}

async function ensureBackendRunning() {
  const alive = await isServiceAlive(`${API_URL}/api/ready`);
  if (alive) return true;

  console.log('[CERTUS] Starting FastAPI backend on 127.0.0.1:8000 from:', ROOT_DIR);
  const venvPython = path.join(ROOT_DIR, '.venv', 'bin', 'python');
  const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

  if (!fs.existsSync(path.join(ROOT_DIR, 'backend'))) {
    console.warn('[CERTUS] Note: backend directory not at', ROOT_DIR);
    return false;
  }

  try {
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
    apiProcess.on('error', (err) => {
      console.warn('[CERTUS] Backend process error:', err.message);
    });
    if (apiProcess.unref) apiProcess.unref();
  } catch (err) {
    console.warn('[CERTUS] Backend spawn exception:', err.message);
  }

  return await waitForService(`${API_URL}/api/ready`, 25, 1000);
}

async function ensureFrontendRunning() {
  const alive = await isServiceAlive(`${WEB_URL}/`);
  if (alive) return true;

  console.log('[CERTUS] Starting Next.js frontend on 127.0.0.1:3000 from:', ROOT_DIR);
  const frontendDir = path.join(ROOT_DIR, 'frontend');

  if (!fs.existsSync(frontendDir)) {
    console.warn('[CERTUS] Note: frontend directory not at', frontendDir);
    return false;
  }

  try {
    frontendProcess = spawn(
      'npx',
      ['next', 'start', '-H', '127.0.0.1', '-p', '3000'],
      {
        cwd: frontendDir,
        env: { ...process.env, NODE_ENV: 'production' },
        stdio: 'ignore',
        detached: process.platform !== 'win32',
      }
    );
    frontendProcess.on('error', (err) => {
      console.warn('[CERTUS] Frontend process error:', err.message);
    });
    if (frontendProcess.unref) frontendProcess.unref();
  } catch (err) {
    console.warn('[CERTUS] Frontend spawn exception:', err.message);
  }

  return await waitForService(`${WEB_URL}/`, 25, 1000);
}

function getSplashHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CERTUS — Starting Workbench</title>
  <style>
    body {
      background: #070707;
      color: #f7f7f4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      -webkit-user-select: none;
      -webkit-app-region: drag;
    }
    .box {
      text-align: center;
      max-width: 460px;
      padding: 40px;
    }
    .mark {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.16em;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .diamond {
      width: 14px;
      height: 14px;
      background: #d4f24a;
      transform: rotate(45deg);
      display: inline-block;
      box-shadow: 0 0 16px rgba(212, 242, 74, 0.45);
    }
    .status {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      color: #9a9a95;
      margin-bottom: 28px;
      letter-spacing: 0.05em;
    }
    .bar {
      width: 100%;
      height: 2px;
      background: #1c1c1c;
      overflow: hidden;
      border-radius: 2px;
      margin-bottom: 24px;
    }
    .bar-fill {
      width: 40%;
      height: 100%;
      background: #d4f24a;
      animation: pulse 1.6s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
    .btn {
      -webkit-app-region: no-drag;
      background: #111;
      border: 1px solid #282828;
      color: #b8b8b2;
      padding: 8px 18px;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .btn:hover {
      border-color: #d4f24a;
      color: #f7f7f4;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="mark">
      <span class="diamond"></span>
      <span>CERTUS</span>
    </div>
    <div class="status" id="st">Connecting to local model engine & workbench...</div>
    <div class="bar"><div class="bar-fill"></div></div>
    <button class="btn" onclick="location.reload()">Retry Connection</button>
  </div>
  <script>
    let tries = 0;
    function poll() {
      fetch('http://localhost:3000/', { mode: 'no-cors' })
        .then(() => {
          document.getElementById('st').innerText = 'Connected! Opening workbench...';
          setTimeout(() => {
            window.location.replace('http://localhost:3000/');
          }, 200);
        })
        .catch(() => {
          tries++;
          if (tries > 25) {
            document.getElementById('st').innerText = 'Waiting for services to finish starting...';
          }
          setTimeout(poll, 800);
        });
    }
    setTimeout(poll, 600);
  </script>
</body>
</html>`;
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

  // Handle load failure gracefully without a blank screen
  mainWindow.webContents.on('did-fail-load', (event, errorCode) => {
    // If connection was refused during initial boot, re-render splash to poll
    if (errorCode === -102 || errorCode === -105 || errorCode === -106 || errorCode === -3) {
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getSplashHtml())}`);
    }
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

  // Check if frontend is already warm
  isServiceAlive(`${WEB_URL}/`).then((alive) => {
    if (alive) {
      mainWindow.loadURL(WEB_URL);
    } else {
      // Show smooth splash while polling connection
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getSplashHtml())}`);
    }
  });

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
  // Start or connect services in background
  Promise.all([
    ensureOllamaRunning(),
    ensureBackendRunning(),
    ensureFrontendRunning(),
  ]).catch((err) => {
    console.warn('[CERTUS] Service bootstrap note:', err.message);
  });

  // Open window immediately with splash/workbench
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
