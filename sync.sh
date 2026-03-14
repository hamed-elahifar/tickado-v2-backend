#!/bin/bash

# Sync Node.js project to Ubuntu server
# Usage: ./sync-to-server.sh [--dry-run] [server_folder_path]

set -e  # Exit on error

# Configuration - EDIT THESE
LOCAL_PATH="$(pwd)/"          # Current project dir (trailing / for contents)
REMOTE_USER="root"    # SSH username
REMOTE_HOST="app.tickado.info"  # Server IP or hostname
REMOTE_BASE="/root/"  # Server base folder
REMOTE_PATH="${REMOTE_BASE}$(basename "$PWD")/"  # Auto: base + project name

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    shift  # Remove arg
fi

if [ $# -eq 1 ]; then
    REMOTE_PATH="$1/"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Syncing ${LOCAL_PATH} to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE (no changes)${NC}"
fi

# Build rsync options
RSYNC_OPTS="-avz --delete --exclude='.env'"
if [ "$DRY_RUN" = true ]; then
    RSYNC_OPTS="$RSYNC_OPTS -n"
fi

# Dry run or confirm real sync
echo -e "${YELLOW}Preview:${NC}"
rsync $RSYNC_OPTS "$LOCAL_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${GREEN}Dry run complete (no changes made)!${NC}"
    exit 0
fi

echo -e "${YELLOW}Proceed with real sync? (y/N):${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Real sync
rsync $RSYNC_OPTS "$LOCAL_PATH" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

echo -e "${GREEN}Sync complete!${NC}"
