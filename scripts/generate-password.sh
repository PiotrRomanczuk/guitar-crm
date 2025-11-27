#!/bin/bash

# Generate a strong random password
# Usage: ./scripts/generate-password.sh [length]
# Default length is 24 characters

LENGTH=${1:-24}

# Generate password using /dev/urandom
# Filter for alphanumeric and safe special chars (avoiding quotes, slashes, etc. that break connection strings)
# Allowed: A-Z, a-z, 0-9, and -_ (Safe for connection strings)
PASSWORD=$(tr -dc 'A-Za-z0-9-_' < /dev/urandom | head -c "$LENGTH")

echo "Generated Secure Password ($LENGTH chars):"
echo "$PASSWORD"
