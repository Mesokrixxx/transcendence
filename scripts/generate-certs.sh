#!/bin/sh
set -eu

umask 077

CA_DIR="certs/ca"
CA_KEY="$CA_DIR/ca.key"
CA_CERT="$CA_DIR/ca.crt"

generate_ca() {
  mkdir -p "$CA_DIR"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out "$CA_KEY"

  openssl req -x509 -key "$CA_KEY" -out "$CA_CERT" -days 3650 \
    -subj "/CN=localhost" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign"
}

generate_certificate() {
  folder="$1"
  cn="$2"
  san="$3"

  folder="certs/$folder"
  mkdir -p "$folder"
  private_key="$folder/private-key.pem"
  certificate="$folder/certificate.pem"
  if [ ! -f "$private_key" ] || [ ! -f "$certificate" ]; then
    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$private_key"
    openssl req -new -key "$private_key" -out "$folder/server.csr" \
    -subj "/CN=$cn" \
    -addext "subjectAltName=$san"

    openssl x509 -req -in "$folder/server.csr" -CA certs/ca/ca.crt -CAkey certs/ca/ca.key -CAcreateserial \
      -out "$certificate" -days 365 -copy_extensions copy
  fi
}

if [ ! -f certs/ca/ca.key ] || [ ! -f certs/ca/ca.crt ]; then
  rm -rf certs
  generate_ca
fi

generate_certificate nginx localhost "DNS:localhost,IP:127.0.0.1"
generate_certificate backend backend "DNS:backend"
cp "$CA_CERT" certs/nginx/backend-ca.crt
