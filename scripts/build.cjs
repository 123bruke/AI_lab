const { execSync } = require('child_process');
const fs = require('fs');

console.log('>>> [BUILD] Starting resilient build process...');

let builtSuccessfully = false;

// 1. If lab_view exists and has package.json, build lab_view
if (fs.existsSync('lab_view/package.json')) {
  try {
    console.log('>>> [BUILD] Building inside lab_view directory...');
    execSync('cd lab_view && npx vite build', { stdio: 'inherit' });
    builtSuccessfully = true;
  } catch (err) {
    console.warn('>>> [BUILD] lab_view build encountered an issue, falling back to root build:', err.message);
  }
}

// 2. If not built or lab_view doesn't exist, build from root
if (!builtSuccessfully) {
  console.log('>>> [BUILD] Building from current directory...');
  execSync('npx vite build', { stdio: 'inherit' });
}

// 3. Guarantee that BOTH dist/ and lab_view/dist/ are populated so Vercel never complains
const rootDist = 'dist';
const labDist = 'lab_view/dist';

if (fs.existsSync(labDist) && !fs.existsSync(rootDist)) {
  console.log('>>> [BUILD] Syncing lab_view/dist to dist...');
  fs.cpSync(labDist, rootDist, { recursive: true });
} else if (fs.existsSync(rootDist) && fs.existsSync('lab_view') && !fs.existsSync(labDist)) {
  console.log('>>> [BUILD] Syncing dist to lab_view/dist...');
  fs.mkdirSync(labDist, { recursive: true });
  fs.cpSync(rootDist, labDist, { recursive: true });
}

console.log('>>> [BUILD] Resilient build process completed successfully.');
