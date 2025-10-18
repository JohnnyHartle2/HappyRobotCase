#!/bin/bash

# Generate SSL certificates for local development
# This script creates self-signed certificates for HTTPS testing

set -e

CERT_DIR="./certs"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

echo "Generating SSL certificates for local development..."

# Create certs directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Check if mkcert is installed
if command -v mkcert &> /dev/null; then
    echo "Using mkcert to generate certificates..."
    
    # Install local CA if not already done
    mkcert -install 2>/dev/null || true
    
    # Generate certificates
    mkcert -key-file "$KEY_FILE" -cert-file "$CERT_FILE" localhost 127.0.0.1 ::1
    
    echo "Certificates generated successfully with mkcert!"
    echo "Certificate: $CERT_FILE"
    echo "Private Key: $KEY_FILE"
else
    echo "mkcert not found, using OpenSSL to generate self-signed certificates..."
    
    # Generate private key
    openssl genrsa -out "$KEY_FILE" 2048
    
    # Generate certificate
    openssl req -new -x509 -key "$KEY_FILE" -out "$CERT_FILE" -days 365 -subj "/C=US/ST=CA/L=San Francisco/O=HappyRobot/OU=Development/CN=localhost"
    
    echo "Self-signed certificates generated successfully!"
    echo "Certificate: $CERT_FILE"
    echo "Private Key: $KEY_FILE"
    echo ""
    echo "Note: You may see browser warnings about self-signed certificates."
    echo "This is normal for local development. Click 'Advanced' and 'Proceed' to continue."
fi

echo ""
echo "To use these certificates, set the following environment variables:"
echo "export HTTPS_ENABLED=true"
echo "export SSL_CERT_PATH=$CERT_FILE"
echo "export SSL_KEY_PATH=$KEY_FILE"
echo ""
echo "Or add them to your .env file:"
echo "HTTPS_ENABLED=true"
echo "SSL_CERT_PATH=$CERT_FILE"
echo "SSL_KEY_PATH=$KEY_FILE"
