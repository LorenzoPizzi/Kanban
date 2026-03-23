const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const config = require('../config/kanban.config');

const WINDOWS = process.platform === 'win32';
const START_TIMEOUT_MS = 45_000;
const NODE_EXECUTABLE = process.execPath;

function ensureRuntimeDir() {
  fs.mkdirSync(config.paths.runtimeDir, { recursive: true });
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeState(state) {
  ensureRuntimeDir();
  fs.writeFileSync(config.paths.stateFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function removeStateFile() {
  try {
    fs.unlinkSync(config.paths.stateFile);
  } catch {}
}

function isProcessAlive(pid) {
  if (!pid) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function requestJson(url, options = {}) {
  const requestUrl = new URL(url);
  const body =
    options.body === undefined
      ? null
      : typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
  const headers = { ...(options.headers || {}) };

  if (body !== null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }

  if (body !== null && !headers['Content-Length']) {
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: requestUrl.hostname,
        port: Number(requestUrl.port),
        path: `${requestUrl.pathname}${requestUrl.search}`,
        method: options.method || 'GET',
        headers,
        timeout: options.timeoutMs || 5_000
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let payload = null;
          try {
            payload = raw ? JSON.parse(raw) : null;
          } catch {}

          resolve({
            ok: (res.statusCode || 500) >= 200 && (res.statusCode || 500) < 300,
            statusCode: res.statusCode || 500,
            data: payload,
            raw
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });
    req.on('error', reject);

    if (body !== null) {
      req.write(body);
    }

    req.end();
  });
}

async function waitForUrl(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await requestJson(url, { timeoutMs: 2_500 });
      if (response.ok) {
        return response;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  throw new Error(`Timeout while waiting for ${url}`);
}

function spawnLoggedProcess(command, args, options) {
  ensureRuntimeDir();

  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  const stdoutPath = path.join(config.paths.runtimeDir, `${options.logName}.stdout.log`);
  const stderrPath = path.join(config.paths.runtimeDir, `${options.logName}.stderr.log`);
  const stdoutStream = fs.createWriteStream(stdoutPath, { flags: 'a' });
  const stderrStream = fs.createWriteStream(stderrPath, { flags: 'a' });

  child.stdout.pipe(stdoutStream);
  child.stderr.pipe(stderrStream);

  return child;
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = WINDOWS
      ? spawn('cmd.exe', ['/c', command, ...args], {
          cwd: options.cwd,
          env: options.env,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        })
      : spawn(command, args, {
          cwd: options.cwd,
          env: options.env,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });

    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `${command} exited with code ${code}`));
    });
  });
}

function getSourceTimestamp(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let latest = 0;

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.angular') {
      continue;
    }

    if (entry.isDirectory()) {
      latest = Math.max(latest, getSourceTimestamp(absolutePath));
      continue;
    }

    latest = Math.max(latest, fs.statSync(absolutePath).mtimeMs);
  }

  return latest;
}

async function ensureFrontendBuild() {
  const indexPath = path.join(config.paths.frontendDistDir, 'index.html');
  const outputExists = fs.existsSync(indexPath);
  const sourceTimestamp = Math.max(
    getSourceTimestamp(path.join(config.paths.frontendRootDir, 'src')),
    getSourceTimestamp(path.join(config.paths.frontendRootDir, 'public')),
    fs.statSync(path.join(config.paths.frontendRootDir, 'angular.json')).mtimeMs,
    fs.statSync(path.join(config.paths.frontendRootDir, 'package.json')).mtimeMs
  );

  const outputTimestamp = outputExists ? fs.statSync(indexPath).mtimeMs : 0;

  if (outputExists && outputTimestamp >= sourceTimestamp) {
    return;
  }

  await runCommand(WINDOWS ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: config.paths.frontendRootDir,
    env: process.env
  });
}

async function ensureDatabaseReady() {
  const env = {
    ...process.env,
    DATABASE_URL: 'file:./kanban-local.db'
  };

  await runCommand(WINDOWS ? 'npm.cmd' : 'npm', ['run', 'db:prepare'], {
    cwd: config.paths.backendRootDir,
    env
  });
}

function openBrowser(url) {
  if (WINDOWS) {
    const child = spawn('cmd.exe', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    child.unref();
    return;
  }

  const opener = spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
  opener.unref();
}

async function getRunningInstance() {
  const state = readJsonFile(config.paths.stateFile);
  if (!state || !isProcessAlive(state.orchestratorPid)) {
    return null;
  }

  try {
    const response = await requestJson(`${config.urls.control}/status`, {
      headers: state.controlSecret ? { 'x-kanban-control-secret': state.controlSecret } : {}
    });

    if (!response.ok) {
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

function stopProcessTree(pid) {
  if (!pid || !isProcessAlive(pid)) {
    return Promise.resolve();
  }

  if (WINDOWS) {
    return runCommand('taskkill', ['/PID', String(pid), '/T', '/F'], {
      cwd: config.paths.rootDir,
      env: process.env
    }).catch(() => {});
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {}

  return Promise.resolve();
}

async function stopChildProcess(child, pid) {
  if (!pid || !isProcessAlive(pid)) {
    return;
  }

  if (child && !child.killed) {
    try {
      child.kill('SIGTERM');
    } catch {}
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < 5_000) {
    if (!isProcessAlive(pid)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  await stopProcessTree(pid);
}

function createControlServer(runtimeState, shutdown) {
  const activityState = {
    enabled: config.inactivity.enabled,
    idleMs: config.inactivity.idleMs,
    warningMs: config.inactivity.warningMs,
    lastActivityAt: new Date().toISOString(),
    warningStartedAt: null,
    shutdownAt: null
  };

  function authenticate(req, res) {
    if (req.headers['x-kanban-control-secret'] !== runtimeState.controlSecret) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Forbidden' }));
      return false;
    }

    return true;
  }

  function respond(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
  }

  function cancelIdleWarning() {
    activityState.warningStartedAt = null;
    activityState.shutdownAt = null;
  }

  function markActivity() {
    activityState.lastActivityAt = new Date().toISOString();
    cancelIdleWarning();
  }

  const interval = setInterval(() => {
    if (!activityState.enabled) {
      return;
    }

    const now = Date.now();
    const lastActivity = new Date(activityState.lastActivityAt).getTime();

    if (!activityState.warningStartedAt && now - lastActivity >= activityState.idleMs) {
      activityState.warningStartedAt = new Date(now).toISOString();
      activityState.shutdownAt = new Date(now + activityState.warningMs).toISOString();
      return;
    }

    if (activityState.shutdownAt && now >= new Date(activityState.shutdownAt).getTime()) {
      shutdown('idle-timeout').catch(() => {});
    }
  }, 30_000);

  const server = http.createServer((req, res) => {
    if (!req.url) {
      respond(res, 400, { message: 'Missing URL' });
      return;
    }

    if (!authenticate(req, res)) {
      return;
    }

    if (req.method === 'GET' && req.url === '/status') {
      respond(res, 200, {
        status: 'ok',
        appName: config.appName,
        urls: config.urls,
        ports: config.ports,
        pids: runtimeState.pids,
        inactivity: activityState
      });
      return;
    }

    if (req.method === 'POST' && req.url === '/activity') {
      markActivity();
      respond(res, 202, { ok: true, inactivity: activityState });
      return;
    }

    if (req.method === 'POST' && req.url === '/cancel-idle-warning') {
      markActivity();
      respond(res, 202, { ok: true, inactivity: activityState });
      return;
    }

    if (req.method === 'POST' && req.url === '/shutdown') {
      respond(res, 202, { ok: true });
      shutdown('user-request').catch(() => {});
      return;
    }

    respond(res, 404, { message: 'Not found' });
  });

  server.listen(config.ports.control, '127.0.0.1');

  return {
    stop() {
      clearInterval(interval);
      return new Promise((resolve) => server.close(resolve));
    }
  };
}

async function stopExistingInstance() {
  const state = readJsonFile(config.paths.stateFile);

  if (!state) {
    console.log('Kanban local is not running.');
    return;
  }

  try {
    const response = await requestJson(`${config.urls.control}/shutdown`, {
      method: 'POST',
      headers: { 'x-kanban-control-secret': state.controlSecret }
    });

    if (!response.ok) {
      throw new Error(response.raw || 'Unable to stop Kanban local');
    }

    console.log('Shutdown requested.');
  } catch (error) {
    if (state.pids) {
      await Promise.all([stopProcessTree(state.pids.backendPid), stopProcessTree(state.pids.frontendPid)]);
    }
    removeStateFile();
    console.log(`Forced cleanup applied: ${error.message}`);
  }
}

async function start() {
  const existing = await getRunningInstance();
  if (existing) {
    openBrowser(config.urls.frontend);
    console.log('Kanban local is already running.');
    return;
  }

  await ensureFrontendBuild();
  await ensureDatabaseReady();

  const runtimeState = {
    appName: config.appName,
    orchestratorPid: process.pid,
    controlSecret: `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    startedAt: new Date().toISOString(),
    ports: config.ports,
    urls: config.urls,
    pids: {
      backendPid: null,
      frontendPid: null
    }
  };

  let control = null;
  let shuttingDown = false;
  let backend = null;
  let frontend = null;

  const shutdown = async (reason) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    if (control) {
      await control.stop().catch(() => {});
    }

    await Promise.all([
      stopChildProcess(frontend, runtimeState.pids.frontendPid),
      stopChildProcess(backend, runtimeState.pids.backendPid)
    ]);

    removeStateFile();
    console.log(`Kanban local stopped (${reason}).`);
    process.exit(0);
  };

  control = createControlServer(runtimeState, shutdown);

  backend = spawnLoggedProcess(NODE_EXECUTABLE, ['src/server.js'], {
    cwd: config.paths.backendRootDir,
    env: {
      ...process.env,
      PORT: String(config.ports.backend),
      FRONTEND_ORIGIN: config.urls.frontend,
      DATABASE_URL: 'file:./kanban-local.db',
      KANBAN_PARENT_CONTROL_URL: config.urls.control,
      KANBAN_CONTROL_SECRET: runtimeState.controlSecret
    },
    logName: 'backend'
  });
  runtimeState.pids.backendPid = backend.pid;

  frontend = spawnLoggedProcess(NODE_EXECUTABLE, [path.join('scripts', 'kanban-frontend-server.js')], {
    cwd: config.paths.rootDir,
    env: {
      ...process.env,
      FRONTEND_PORT: String(config.ports.frontend),
      BACKEND_PORT: String(config.ports.backend),
      FRONTEND_DIST_DIR: config.paths.frontendDistDir
    },
    logName: 'frontend'
  });
  runtimeState.pids.frontendPid = frontend.pid;

  writeState(runtimeState);

  backend.on('exit', () => {
    if (!shuttingDown) {
      shutdown('backend-exit').catch(() => {});
    }
  });
  frontend.on('exit', () => {
    if (!shuttingDown) {
      shutdown('frontend-exit').catch(() => {});
    }
  });

  await waitForUrl(`${config.urls.backend}/health`, START_TIMEOUT_MS);
  await waitForUrl(`${config.urls.frontend}/health`, START_TIMEOUT_MS);

  openBrowser(config.urls.frontend);
  console.log(`Kanban local started on ${config.urls.frontend}`);

  process.on('SIGINT', () => {
    shutdown('sigint').catch(() => {});
  });
  process.on('SIGTERM', () => {
    shutdown('sigterm').catch(() => {});
  });
}

async function main() {
  const command = process.argv[2] || 'start';

  if (command === 'stop') {
    await stopExistingInstance();
    return;
  }

  await start();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
