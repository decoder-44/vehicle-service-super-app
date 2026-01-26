#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all prerequisites and setup are correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = [];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  checks.push({
    name: description,
    passed: exists,
    message: exists ? `✓ Found: ${filePath}` : `✗ Missing: ${filePath}`,
  });
}

function checkDirectoryExists(dirPath, description) {
  const fullPath = path.join(__dirname, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  checks.push({
    name: description,
    passed: exists,
    message: exists ? `✓ Found: ${dirPath}` : `✗ Missing: ${dirPath}`,
  });
}

function checkNodeModules() {
  const exists = fs.existsSync(path.join(__dirname, 'node_modules'));
  checks.push({
    name: 'Dependencies Installed',
    passed: exists,
    message: exists ? '✓ node_modules found' : '✗ Run: npm install',
  });
}

function checkEnvFile() {
  const exists = fs.existsSync(path.join(__dirname, '.env'));
  checks.push({
    name: 'Environment File',
    passed: exists,
    message: exists ? '✓ .env file found' : '✗ Run: cp .env.example .env',
  });
}

// Run all checks
log('\n🔍 Running Setup Verification Checks...\n', 'blue');

log('Checking Project Structure...', 'yellow');
checkFileExists('package.json', 'Package Configuration');
checkFileExists('server.js', 'Server Entry Point');
checkFileExists('.env.example', 'Environment Template');
checkFileExists('.gitignore', 'Git Ignore');
checkFileExists('README.md', 'Documentation');

log('\nChecking Source Directories...', 'yellow');
checkDirectoryExists('src', 'Source Directory');
checkDirectoryExists('src/config', 'Config Module');
checkDirectoryExists('src/modules', 'Modules Directory');
checkDirectoryExists('src/modules/auth', 'Auth Module');
checkDirectoryExists('src/database', 'Database Module');
checkDirectoryExists('src/middleware', 'Middleware Module');
checkDirectoryExists('src/utils', 'Utils Module');

log('\nChecking Database Setup...', 'yellow');
checkFileExists('src/database/connection.js', 'Database Connection');
checkFileExists('src/database/migrate.js', 'Migration Runner');
checkDirectoryExists('src/database/migrations', 'Migrations Directory');
checkFileExists('src/database/migrations/001_create_core_tables.sql', 'Core Tables Migration');

log('\nChecking Auth Module...', 'yellow');
checkFileExists('src/modules/auth/routes.js', 'Auth Routes');
checkFileExists('src/modules/auth/controller.js', 'Auth Controller');
checkFileExists('src/modules/auth/service.js', 'Auth Service');

log('\nChecking Configuration...', 'yellow');
checkNodeModules();
checkEnvFile();

// Print results
log('\n' + '='.repeat(60), 'blue');
log('Setup Verification Results', 'blue');
log('='.repeat(60) + '\n', 'blue');

let passedCount = 0;
let failedCount = 0;

checks.forEach((check) => {
  const color = check.passed ? 'green' : 'red';
  log(`${check.message}`, color);

  if (check.passed) {
    passedCount++;
  } else {
    failedCount++;
  }
});

log('\n' + '='.repeat(60), 'blue');
log(`Total: ${passedCount} passed, ${failedCount} failed`, failedCount > 0 ? 'red' : 'green');
log('='.repeat(60) + '\n', 'blue');

if (failedCount === 0) {
  log('✓ All checks passed! Your setup is ready.', 'green');
  log('\nNext steps:', 'yellow');
  log('1. Update .env with your configuration');
  log('2. Run: npm run migrate');
  log('3. Run: npm run dev');
  log('\nFor details, see QUICKSTART.md\n', 'blue');
  process.exit(0);
} else {
  log('✗ Some checks failed. Please fix the issues above.', 'red');
  log('\nFor help, see README.md or QUICKSTART.md\n', 'yellow');
  process.exit(1);
}
