#!/usr/bin/env node
const execPath = process.env.npm_execpath || '';
if (!execPath.includes('pnpm')) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    'Error: City Connector only allows pnpm as the package manager.',
  );
  console.error('Run: corepack enable && pnpm install');
  process.exit(1);
}
