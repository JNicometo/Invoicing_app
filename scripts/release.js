#!/usr/bin/env node

/**
 * Release Helper Script
 *
 * This script helps automate the release process:
 * 1. Bumps version in package.json
 * 2. Creates a git tag
 * 3. Pushes to GitHub
 * 4. GitHub Actions will automatically build and create a release
 *
 * Usage:
 *   node scripts/release.js patch  # 1.0.0 -> 1.0.1
 *   node scripts/release.js minor  # 1.0.0 -> 1.1.0
 *   node scripts/release.js major  # 1.0.0 -> 2.0.0
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Get version bump type from command line
const bumpType = process.argv[2];

if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('❌ Error: Invalid bump type');
  console.log('Usage: node scripts/release.js [patch|minor|major]');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/release.js patch  # 1.0.0 -> 1.0.1');
  console.log('  node scripts/release.js minor  # 1.0.0 -> 1.1.0');
  console.log('  node scripts/release.js major  # 1.0.0 -> 2.0.0');
  process.exit(1);
}

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Calculate new version
let newVersion;
switch (bumpType) {
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
}

console.log('');
console.log('🚀 InvoicePro Release Helper');
console.log('============================');
console.log('');
console.log(`Current version: ${currentVersion}`);
console.log(`New version:     ${newVersion}`);
console.log(`Bump type:       ${bumpType}`);
console.log('');

// Confirm with user
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Proceed with release? (yes/no): ', (answer) => {
  readline.close();

  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('❌ Release cancelled');
    process.exit(0);
  }

  try {
    console.log('');
    console.log('📝 Updating package.json...');
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log('✅ Version updated in package.json');
    console.log('');

    console.log('🔍 Checking git status...');
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status && !status.includes('package.json')) {
      console.log('⚠️  Warning: You have uncommitted changes');
      console.log('');
    }

    console.log('📦 Committing version bump...');
    execSync('git add package.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });

    console.log('🏷️  Creating git tag...');
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });

    console.log('⬆️  Pushing to GitHub...');
    execSync('git push', { stdio: 'inherit' });
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });

    console.log('');
    console.log('✅ Release process completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. GitHub Actions will automatically build the app');
    console.log('2. A draft release will be created on GitHub');
    console.log('3. Review and publish the release');
    console.log('');
    console.log(`Release URL: https://github.com/JNicometo/Invoicing_app/releases/tag/v${newVersion}`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Error during release process:');
    console.error(error.message);
    console.error('');
    console.error('You may need to manually clean up:');
    console.error('  git reset HEAD~1  # Undo commit');
    console.error(`  git tag -d v${newVersion}  # Delete tag`);
    process.exit(1);
  }
});
