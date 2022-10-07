#!/usr/bin/env node

import { Command } from 'commander';
import app from '../src/index.js';

const program = new Command();

program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.1.0')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")')
  .argument('<url>')
  .action((url) => {
    const { output } = program.opts();
    const path = process.cwd() ?? output;
    console.log('url:', url);
    console.log('path:', path);
    app(path, url);
  })
  .parse(process.argv);
