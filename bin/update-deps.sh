#!/bin/bash

echo "Checking and updating all dependencies in package.json..."

# Use npx to run npm-check-updates without requiring global installation
# -u will upgrade your package.json dependencies to the latest versions
npx npm-check-updates -u

echo "Installing updated dependencies..."
npm install

echo "Dependencies updated successfully!"
