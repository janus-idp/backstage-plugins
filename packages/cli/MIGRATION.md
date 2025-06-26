# Migration Guide: @janus-idp/cli → @red-hat-developer-hub/cli

⚠️ **The @janus-idp/cli is deprecated and will no longer receive updates.**

This guide will help you migrate from the deprecated `@janus-idp/cli` to the new `@red-hat-developer-hub/cli`.

## Overview

The Red Hat Developer Hub team has introduced a new CLI tool that replaces the `@janus-idp/cli` with improved functionality and better maintainability. The new CLI offers more flexibility and ease of use for developing, packaging, and distributing dynamic plugins for Red Hat Developer Hub (RHDH).

## Command Migration

### Export Dynamic Plugin

**Old Command:**
```bash
npx @janus-idp/cli package export-dynamic-plugin
```

**New Command:**
```bash
npx @red-hat-developer-hub/cli plugin export
```

### Package Dynamic Plugins

**Old Command:**
```bash
npx @janus-idp/cli package package-dynamic-plugins
```

**New Command:**
```bash
npx @red-hat-developer-hub/cli plugin package
```

### NPM Scripts Example

**Before:**
```json
{
  "scripts": {
    "export-dynamic": "@janus-idp/cli package export-dynamic-plugin",
    "package-plugins": "@janus-idp/cli package package-dynamic-plugins"
  }
}
```

**After:**
```json
{
  "scripts": {
    "export-dynamic": "@red-hat-developer-hub/cli plugin export",
    "package-plugins": "@red-hat-developer-hub/cli plugin package"
  }
}
```

## Support and Resources

- **New CLI Repository**: https://github.com/redhat-developer/rhdh-cli
- **Documentation**: Available in the new CLI repository
- **Issues**: Report issues and bugs in Jira at https://issues.redhat.com/projects/RHIDP/summary

## Getting Help

If you encounter issues during migration:

1. Check the new CLI documentation: https://github.com/redhat-developer/rhdh-cli
2. Compare command options between old and new CLI using `--help`
3. Open an issue in the new CLI repository if you find missing functionality
