#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for production...');

// First build the frontend
const viteBuild = spawn('npx', ['vite', 'build'], { 
  stdio: 'inherit',
  shell: true 
});

viteBuild.on('close', (code) => {
  if (code !== 0) {
    console.error('Frontend build failed');
    process.exit(1);
  }
  
  console.log('Frontend build complete, building backend...');
  
  // Then build the backend with the production entry point
  const esbuildCmd = spawn('npx', [
    'esbuild', 
    'server/index-prod.ts', 
    '--platform=node', 
    '--packages=external', 
    '--bundle', 
    '--format=esm', 
    '--outdir=dist'
  ], { 
    stdio: 'inherit',
    shell: true 
  });
  
  esbuildCmd.on('close', (code) => {
    if (code !== 0) {
      console.error('Backend build failed');
      process.exit(1);
    }
    console.log('Production build complete!');
  });
});