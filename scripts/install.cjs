const { execSync } = require('child_process');
const fs = require('fs');

console.log('>>> [INSTALL] Starting resilient dependency installation...');

// 1. Install root dependencies if package.json exists
if (fs.existsSync('package.json')) {
  console.log('>>> [INSTALL] Running npm install in current directory...');
  execSync('npm install', { stdio: 'inherit' });
}

// 2. Install lab_view dependencies only if lab_view exists and has package.json
if (fs.existsSync('lab_view/package.json')) {
  console.log('>>> [INSTALL] Found lab_view directory, installing sub-package dependencies...');
  try {
    execSync('cd lab_view && npm install', { stdio: 'inherit' });
  } catch (err) {
    console.warn('>>> [INSTALL] Notice: lab_view install skipped or completed with warnings:', err.message);
  }
}

console.log('>>> [INSTALL] Resilient installation completed.');
