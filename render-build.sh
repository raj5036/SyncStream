#!/usr/bin/env bash
set -o errexit

# Build Client
cd client
npm install
npm run build

# Build Server
cd ../server
npm install
npm run build
