# Yarn Standalone

A portable, single-file executable for Yarn package manager, similar to `wp-cli.phar` for WordPress.

## Overview

Yarn Standalone bundles Yarn Classic (1.22.22) into a self-contained executable that requires no prior Yarn installation. On first run, it downloads and caches the Yarn runtime automatically.

## Installation

### Pre-built Binaries

Download the appropriate binary for your platform from the releases page:

- `yarn-linux-x64` - Linux (x64)
- `yarn-macos-x64` - macOS (x64)
- `yarn-win-x64.exe` - Windows (x64)

Make it executable (Linux/macOS):
```bash
chmod +x yarn-linux-x64
mv yarn-linux-x64 /usr/local/bin/yarn
```

### Build from Source

Requires Node.js 22+.

```bash
# Install dependencies
npm install

# Build for current platform (Linux)
npm run build

# Build for all platforms
npm run build:all
```

Binaries are output to the `dist/` directory.

## Usage

```bash
# Standard Yarn commands work as expected
./yarn install
./yarn add lodash
./yarn run build

# Built-in self commands
./yarn self:help      # Show help message
./yarn self:version   # Show version information
./yarn self:info      # Show environment information
./yarn self:update    # Re-download the Yarn runtime
./yarn self:clean     # Remove cached files
```

## How It Works

1. On first run, downloads `yarn-1.22.22.js` from GitHub releases
2. Caches the file in `~/.yarn-standalone/`
3. Subsequent runs use the cached Yarn runtime
4. All commands are passed through to the bundled Yarn

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `YARN_STANDALONE_CACHE` | Custom cache directory | `~/.yarn-standalone` |

## Supported Platforms

- Linux x64
- macOS x64
- Windows x64

## Project Structure

```
yarn-standalone/
├── src/
│   └── cli.js          # Main CLI entry point
├── dist/               # Built binaries (after build)
├── package.json
└── README.md
```

## License

MIT
