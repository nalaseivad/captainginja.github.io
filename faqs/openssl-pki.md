---
layout: faq
title: A Basic PKI Using OpenSSL
sub_title: For those of a free DIY persuasion
faq: true
---

# Background

See this [blog post]({{ site.baseurl }}{% post_url 2026-02-18-on-digital-certificates %}) for some background on what
this is all about.

# The recipe

## 0) Create folders and a reusable OpenSSL config template

On your CA machine (Linux):

```
mkdir -p ~/pki/{root,intermediate,certs,csr}
mkdir -p ~/pki/root/{certs,crl,newcerts,private}
mkdir -p ~/pki/intermediate/{certs,crl,csr,newcerts,private}

chmod 700 ~/pki/root/private ~/pki/intermediate/private
touch ~/pki/root/index.txt ~/pki/intermediate/index.txt
echo 1000 > ~/pki/root/serial
echo 2000 > ~/pki/intermediate/serial
```

Create ~/pki/openssl-ec.cnf:

```
# ~/pki/openssl-ec.cnf
# Template: replace __CA_DIR__ and __CN__. SANs are appended dynamically.

[ ca ]
default_ca = CA_default

[ CA_default ]
dir               = __CA_DIR__
certs             = $dir/certs
crl_dir           = $dir/crl
new_certs_dir     = $dir/newcerts
database          = $dir/index.txt
serial            = $dir/serial

private_key       = $dir/private/ca.key.pem
certificate       = $dir/certs/ca.cert.pem

default_md        = sha256
policy            = policy_loose
default_days      = 825

[ policy_loose ]
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
prompt              = no
default_md          = sha256
distinguished_name  = dn

[ dn ]
C  = US
ST = Connecticut
L  = Wilton
O  = Example Org
OU = PKI
CN = __CN__

[ v3_root_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:1
keyUsage = critical, keyCertSign, cRLSign

[ v3_intermediate_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, keyCertSign, cRLSign

[ server_cert ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[ alt_names ]
# dynamically generated entries go here
```

## 1) Root CA with ECC (ECDSA P-256)

### 1a) Root key

```
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/root/private/ca.key.pem

chmod 400 ~/pki/root/private/ca.key.pem
```

### 1b) Root self-signed certificate

```
sed \
  -e "s|__CA_DIR__|$HOME/pki/root|g" \
  -e "s|__CN__|Example Root CA (EC)|g" \
  ~/pki/openssl-ec.cnf > ~/pki/root/openssl-root.cnf

openssl req -config ~/pki/root/openssl-root.cnf \
  -new -x509 -days 3650 -sha256 \
  -key ~/pki/root/private/ca.key.pem \
  -extensions v3_root_ca \
  -out ~/pki/root/certs/ca.cert.pem

chmod 444 ~/pki/root/certs/ca.cert.pem
```

## 2) Intermediate CA with ECC, signed by Root

### 2a) Intermediate key

```
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/intermediate/private/ca.key.pem

chmod 400 ~/pki/intermediate/private/ca.key.pem
```

### 2b) Intermediate CSR

```
sed \
  -e "s|__CA_DIR__|$HOME/pki/intermediate|g" \
  -e "s|__CN__|Example Intermediate CA (EC)|g" \
  ~/pki/openssl-ec.cnf > ~/pki/intermediate/openssl-intermediate.cnf

openssl req -config ~/pki/intermediate/openssl-intermediate.cnf \
  -new -sha256 \
  -key ~/pki/intermediate/private/ca.key.pem \
  -out ~/pki/intermediate/csr/ca.csr.pem
```

### 2c) Sign intermediate cert using Root

```
openssl ca -config ~/pki/root/openssl-root.cnf \
  -extensions v3_intermediate_ca \
  -days 3650 -notext -md sha256 \
  -in ~/pki/intermediate/csr/ca.csr.pem \
  -out ~/pki/intermediate/certs/ca.cert.pem

chmod 444 ~/pki/intermediate/certs/ca.cert.pem
```

### 2d) Make a chain file (Intermediate then Root)

```
cat ~/pki/intermediate/certs/ca.cert.pem \
    ~/pki/root/certs/ca.cert.pem > ~/pki/intermediate/certs/ca-chain.cert.pem

chmod 444 ~/pki/intermediate/certs/ca-chain.cert.pem
```

## 3) Flexible SAN support: generate a per-server config dynamically

Create ~/pki/make-server-config.sh:

```
cat > ~/pki/make-server-config.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   make-server-config.sh <CN> <OUT_CONFIG> [SAN1] [SAN2] ... [SANN]
#
# SAN entries can be hostnames or IPv4/IPv6 literals.
#
# Example:
#   ./make-server-config.sh "www.example.internal" "/home/me/pki/tmp/server1.cnf" \
#     "www.example.internal" "api.example.internal" "192.168.1.50" "2001:db8::10"

CN="$1"
OUT_CONFIG="$2"
shift 2

TEMPLATE="$HOME/pki/openssl-ec.cnf"
INTERMEDIATE_DIR="$HOME/pki/intermediate"

# Base config with CN and CA dir filled
sed \
  -e "s|__CA_DIR__|${INTERMEDIATE_DIR}|g" \
  -e "s|__CN__|${CN}|g" \
  "${TEMPLATE}" > "${OUT_CONFIG}"

# Append SANs into [alt_names]
# OpenSSL requires numbered keys: DNS.1, DNS.2, IP.1, IP.2, ...
dns_i=0
ip_i=0

# Ensure we append after the existing [alt_names] marker
# We just add lines at the end of file since template already contains [alt_names]
for san in "$@"; do
  # Very simple detection: if it contains ':' assume IPv6, else if it is dotted quad assume IPv4, else DNS.
  if [[ "$san" == *:* ]]; then
    ((ip_i++))
    printf "IP.%d = %s\n" "$ip_i" "$san" >> "${OUT_CONFIG}"
  elif [[ "$san" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    ((ip_i++))
    printf "IP.%d = %s\n" "$ip_i" "$san" >> "${OUT_CONFIG}"
  else
    ((dns_i++))
    printf "DNS.%d = %s\n" "$dns_i" "$san" >> "${OUT_CONFIG}"
  fi
done
EOF

chmod +x ~/pki/make-server-config.sh
```

This enables zero SANs (no extra args) or N SANs (as many args as you want). Browsers generally require SANs, so in
practice you will supply at least one DNS name.

## 4) Create ECC server key, CSR and sign via Intermediate

### 4a) Server key (ECC)

```
mkdir -p ~/pki/certs/server1

openssl genpkey -algorithm EC \
  -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/certs/server1/server.key.pem

chmod 400 ~/pki/certs/server1/server.key.pem
```

### 4b) Generate a per-server config with N SANs

Example: 3 DNS SANs and 2 IP SANs

```
~/pki/make-server-config.sh \
  "www.example.internal" \
  ~/pki/tmp/server1.cnf \
  "www.example.internal" \
  "example.internal" \
  "api.example.internal" \
  "192.168.1.50" \
  "10.0.0.12"
```

### 4c) Create the CSR

```
openssl req -new -sha256 \
  -key ~/pki/certs/server1/server.key.pem \
  -config ~/pki/tmp/server1.cnf \
  -out ~/pki/csr/server1.csr.pem```
```

### 4d) Sign and issue the server cert (ECC leaf) using the Intermediate CA

```
openssl ca -config ~/pki/intermediate/openssl-intermediate.cnf \
  -extensions server_cert \
  -days 397 -notext -md sha256 \
  -in ~/pki/csr/server1.csr.pem \
  -out ~/pki/certs/server1/server.cert.pem

chmod 444 ~/pki/certs/server1/server.cert.pem
```

Verify chain:

```
openssl verify -CAfile ~/pki/intermediate/certs/ca-chain.cert.pem \
  ~/pki/certs/server1/server.cert.pem
```

Verify SANs:

```
openssl x509 -noout -text -in ~/pki/certs/server1/server.cert.pem | grep -A2 "Subject Alternative Name"
```

## 5) Install on Linux nginx, TLS 1.3 only

Copy to the nginx server:

* server.key.pem
* server.cert.pem
* intermediate/certs/ca.cert.pem (intermediate cert)

On the nginx host:

```
sudo mkdir -p /etc/nginx/tls
sudo chmod 700 /etc/nginx/tls

sudo cp server.key.pem /etc/nginx/tls/
sudo cp server.cert.pem /etc/nginx/tls/
sudo cp ca.cert.pem /etc/nginx/tls/intermediate.cert.pem

sudo chmod 600 /etc/nginx/tls/server.key.pem
sudo chmod 644 /etc/nginx/tls/server.cert.pem /etc/nginx/tls/intermediate.cert.pem

Build a fullchain file (leaf first, then intermediate):

sudo bash -c 'cat /etc/nginx/tls/server.cert.pem /etc/nginx/tls/intermediate.cert.pem > /etc/nginx/tls/fullchain.pem'
sudo chmod 644 /etc/nginx/tls/fullchain.pem
```

nginx site config:

```
server {
    listen 443 ssl;
    server_name www.example.internal example.internal;

    ssl_certificate     /etc/nginx/tls/fullchain.pem;
    ssl_certificate_key /etc/nginx/tls/server.key.pem;

    ssl_protocols TLSv1.3;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

Reload:

```
sudo nginx -t
sudo systemctl reload nginx
```

Test from a client:

```
openssl s_client -connect www.example.internal:443 -servername www.example.internal -tls1_3
```

## 6) Install on Windows Server IIS (ECC cert), TLS 1.3 where supported

### 6a) Create a PFX (PKCS#12) for Windows import

On the CA machine:

```
openssl pkcs12 -export \
  -out ~/pki/certs/server1/server1-ec.pfx \
  -inkey ~/pki/certs/server1/server.key.pem \
  -in ~/pki/certs/server1/server.cert.pem \
  -certfile ~/pki/intermediate/certs/ca.cert.pem
```

This bundles the leaf cert + private key + intermediate cert.

### 6b) Import into Local Machine\My

On Windows Server, PowerShell:

```
$pwd = Read-Host -AsSecureString
Import-PfxCertificate -FilePath C:\path\server1-ec.pfx -CertStoreLocation Cert:\LocalMachine\My -Password $pwd
```

### 6c) Ensure Intermediate is present

If the intermediate does not land correctly, import it into:

* Local Machine → Intermediate Certification Authorities

(You can import ca.cert.pem for the intermediate there.)

### 6d) Bind in IIS

```
IIS Manager → Sites → your site → Bindings… → add or edit https :443 → select the certificate.
```

Note on TLS 1.3 in IIS: whether IIS actually negotiates TLS 1.3 depends on Windows build and Schannel settings. Your
cert is fine either way, and it will still be “modern” cryptography, but TLS 1.3 enablement is OS-policy-controlled.

## 7) Install Root CA trust on Linux clients

Debian or Ubuntu

Convert to .crt name, copy, update:

```
sudo cp ~/pki/root/certs/ca.cert.pem /usr/local/share/ca-certificates/example-root-ec.crt
sudo update-ca-certificates
```

RHEL or Fedora

```
sudo cp ~/pki/root/certs/ca.cert.pem /etc/pki/ca-trust/source/anchors/example-root-ec.crt
sudo update-ca-trust
```

## 8) Install Root CA trust on Windows clients

Windows likes DER .cer. Convert on Linux:

```
openssl x509 -in ~/pki/root/certs/ca.cert.pem -outform der -out ~/pki/root/certs/root-ec.cer
```

Import into Trusted Root store (PowerShell as admin):

```
Import-Certificate -FilePath C:\path\root-ec.cer -CertStoreLocation Cert:\LocalMachine\Root
```

## 9) What files go where

CA side

* Root: root/private/ca.key.pem and root/certs/ca.cert.pem
* Intermediate: intermediate/private/ca.key.pem and intermediate/certs/ca.cert.pem

Server side

* Leaf key: server.key.pem
* Leaf cert: server.cert.pem
* Intermediate cert for chain presentation: intermediate.cert.pem (or the fullchain.pem you build)

Client side

* Trust anchor: root/certs/ca.cert.pem only (root CA)

## 10) The two most common modern failures

* No SANs or wrong SANs (CN does not save you in browsers)
* Server does not present the intermediate (client can’t build the chain even if it trusts the root)
