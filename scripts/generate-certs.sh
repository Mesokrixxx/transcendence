#!/bin/sh
set -eu

umask 077

CA_DIR="certs/ca"
CA_KEY="$CA_DIR/ca.key"
CA_CERT="$CA_DIR/ca.crt"

generate_ca() {
  mkdir -p "$CA_DIR"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out "$CA_KEY"

  openssl req -new -x509 -key "$CA_KEY" -out "$CA_CERT" -days 3650 \
    -subj "/CN=Transcendence Local Root CA" \
    -sha256 \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign,digitalSignature" \
    -addext "subjectKeyIdentifier=hash" \
    -addext "authorityKeyIdentifier=keyid:always"
}

generate_certificate() {
  folder="$1"
  cn="$2"
  san="$3"

  folder="certs/$folder"
  mkdir -p "$folder"
  private_key="$folder/private-key.pem"
  certificate="$folder/certificate.pem"
  needs_regeneration=false
  if [ ! -f "$private_key" ] || [ ! -f "$certificate" ]; then
    needs_regeneration=true
  elif ! openssl x509 -in "$certificate" -noout -text 2>/dev/null |
    grep -q "TLS Web Server Authentication"; then
    needs_regeneration=true
  elif ! openssl x509 -in "$certificate" -noout -text 2>/dev/null |
    grep -q "Key Encipherment"; then
    needs_regeneration=true
  elif ! openssl verify -CAfile "$CA_CERT" "$certificate" >/dev/null 2>&1; then
    needs_regeneration=true
  fi

  if [ "$needs_regeneration" = true ]; then
    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$private_key"
    openssl req -new -key "$private_key" -out "$folder/server.csr" \
    -subj "/CN=$cn"

    extensions="$folder/server.ext"
    cat > "$extensions" <<EOF
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=critical,TLS Web Server Authentication
subjectAltName=$san
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
EOF

    openssl x509 -req -in "$folder/server.csr" -CA certs/ca/ca.crt -CAkey certs/ca/ca.key -CAcreateserial \
      -out "$certificate" -days 365 -sha256 -extfile "$extensions"
  fi
}

if [ ! -f certs/ca/ca.key ] || [ ! -f certs/ca/ca.crt ] ||
  ! openssl x509 -in "$CA_CERT" -noout -subject 2>/dev/null |
  grep -q "CN=Transcendence Local Root CA"; then
  generate_ca
fi

generate_certificate nginx localhost "DNS:localhost,IP:127.0.0.1"
generate_certificate backend backend "DNS:backend"
cp "$CA_CERT" certs/nginx/backend-ca.crt
cat certs/nginx/certificate.pem "$CA_CERT" > certs/nginx/fullchain.pem
