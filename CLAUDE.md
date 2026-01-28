# CLAUDE.md

This file provides context for Claude Code when working with this repository.

## Project Overview

Yarn Standalone is a portable Yarn CLI wrapper that bundles Yarn Classic into a single executable using `@yao-pkg/pkg`. It downloads and caches the Yarn runtime on first use.

## Key Files

- `src/cli.js` - Main entry point, contains the `YarnStandalone` class
- `package.json` - Build configuration and pkg targets

## Build Commands

```bash
npm run build      # Build for Linux x64 only
npm run build:all  # Build for Linux, macOS, and Windows
```

## Architecture

The CLI works by:
1. Checking for cached Yarn runtime in `~/.yarn-standalone/`
2. Downloading from GitHub releases if not cached
3. Spawning Node.js with the cached Yarn script
4. Passing all arguments through to Yarn

## Self Commands

Commands prefixed with `self:` are handled internally:
- `self:help` - Show help
- `self:version` - Show version
- `self:info` - Show environment info
- `self:update` - Re-download Yarn
- `self:clean` - Clear cache

## Dependencies

- `@yao-pkg/pkg` (dev) - Bundles Node.js app into standalone executables
- No runtime dependencies - uses only Node.js built-in modules

## Notes

- Targets Node.js 22
- Bundles Yarn Classic 1.22.22 (not Yarn Berry/v2+)
- Cache directory can be overridden with `YARN_STANDALONE_CACHE` env var
