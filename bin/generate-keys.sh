#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Generate private key
openssl genrsa -out "$PROJECT_DIR/config/keys/private.key" 2048

# Generate public key
openssl rsa -in "$PROJECT_DIR/config/keys/private.key" -pubout -out "$PROJECT_DIR/config/keys/public.key"