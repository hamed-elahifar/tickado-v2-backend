!#/bin/bash

# Generate private key
openssl genrsa -out config/keys/private.key 2048

# Generate public key
openssl rsa -in config/keys/private.key -pubout -out config/keys/public.key