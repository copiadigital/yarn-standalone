#!/usr/bin/env node
/**
 * Yarn Standalone CLI
 * A portable, single-file executable for Yarn package manager
 * Similar to wp-cli.phar for WordPress
 */

'use strict';

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const VERSION = '1.0.0';
const YARN_VERSION = '1.22.22';

class YarnStandalone {
  constructor() {
    this.homeDir = os.homedir();
    this.cacheDir = process.env.YARN_STANDALONE_CACHE || path.join(this.homeDir, '.yarn-standalone');
    this.yarnPath = path.join(this.cacheDir, `yarn-${YARN_VERSION}.js`);
  }

  showHelp() {
    console.log(`
Yarn Standalone v${VERSION} (Yarn ${YARN_VERSION})
A portable, single-file Yarn executable (like wp-cli.phar)

Usage:
  ./yarn [command] [options]

Built-in Commands:
  self:help           Show this help message
  self:version        Show version information
  self:update         Re-download the Yarn runtime
  self:info           Show environment information
  self:clean          Remove cached files

All other commands are passed directly to Yarn.

Examples:
  ./yarn install
  ./yarn add lodash
  ./yarn run build

Environment Variables:
  YARN_STANDALONE_CACHE    Custom cache directory (default: ~/.yarn-standalone)
`);
  }

  showVersion() {
    console.log(`yarn-standalone/${VERSION} yarn/${YARN_VERSION} node/${process.version.slice(1)} ${process.platform}/${process.arch}`);
  }

  showInfo() {
    console.log(`Yarn Standalone v${VERSION}`);
    console.log(`────────────────────────────`);
    console.log(`Bundled Yarn:    ${YARN_VERSION}`);
    console.log(`Node.js:         ${process.version}`);
    console.log(`Platform:        ${process.platform} ${process.arch}`);
    console.log(`Cache Dir:       ${this.cacheDir}`);
    console.log(`Yarn Cached:     ${fs.existsSync(this.yarnPath) ? 'Yes' : 'No'}`);
    console.log(`Working Dir:     ${process.cwd()}`);
  }

  downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);

      const request = (url) => {
        https.get(url, { headers: { 'User-Agent': 'yarn-standalone' } }, (response) => {
          if (response.statusCode === 302 || response.statusCode === 301) {
            request(response.headers.location);
            return;
          }
          if (response.statusCode !== 200) {
            fs.unlinkSync(dest);
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          fs.unlinkSync(dest);
          reject(err);
        });
      };

      request(url);
    });
  }

  async ensureYarn() {
    if (fs.existsSync(this.yarnPath)) {
      return this.yarnPath;
    }

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    const url = `https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-${YARN_VERSION}.js`;

    process.stderr.write(`Downloading Yarn v${YARN_VERSION}... `);

    try {
      await this.downloadFile(url, this.yarnPath);
      console.error('done.');
    } catch (err) {
      console.error('failed.');
      throw new Error(`Failed to download Yarn: ${err.message}`);
    }

    return this.yarnPath;
  }

  async runYarn(args) {
    const yarnPath = await this.ensureYarn();

    const child = spawn(process.execPath, [yarnPath, ...args], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, YARN_IGNORE_PATH: '1' }
    });

    return new Promise((resolve) => {
      child.on('close', (code) => resolve(code || 0));
      child.on('error', () => resolve(1));
    });
  }

  async selfUpdate() {
    if (fs.existsSync(this.yarnPath)) {
      fs.unlinkSync(this.yarnPath);
    }
    await this.ensureYarn();
    console.log('Yarn runtime updated.');
  }

  selfClean() {
    if (fs.existsSync(this.cacheDir)) {
      fs.rmSync(this.cacheDir, { recursive: true });
      console.log('Cache cleaned.');
    } else {
      console.log('Nothing to clean.');
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const cmd = args[0];

    // Handle self commands
    switch (cmd) {
      case 'self:help':
      case '--help':
      case '-h':
        this.showHelp();
        return 0;

      case 'self:version':
      case '--version':
      case '-v':
        this.showVersion();
        return 0;

      case 'self:info':
        this.showInfo();
        return 0;

      case 'self:update':
        await this.selfUpdate();
        return 0;

      case 'self:clean':
        this.selfClean();
        return 0;
    }

    // Pass to Yarn
    return this.runYarn(args);
  }
}

const cli = new YarnStandalone();
cli.run()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
