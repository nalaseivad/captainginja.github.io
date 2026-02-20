---
layout: faq
title: A Basic PKI Using OpenSSL
sub_title: For those of a free, DIY persuasion
faq: true
---

# Background

See this [blog post]({{ site.baseurl }}{% post_url 2026-02-19-on-digital-certificates %}) for some background on what
this is all about.

# The recipe

## 0) Create PKI directory structure

On your CA machine (Linux):

```
mkdir -p ~/pki/{root,intermediate,certs,csr,tmp}

mkdir -p ~/pki/root/{certs,crl,newcerts,private}
mkdir -p ~/pki/intermediate/{certs,crl,csr,newcerts,private}

chmod 700 ~/pki/root/private ~/pki/intermediate/private

touch ~/pki/root/index.txt ~/pki/intermediate/index.txt
echo 1000 > ~/pki/root/serial
echo 2000 > ~/pki/intermediate/serial
```

## 1) Create the OpenSSL config template with profiles

Create ~/pki/openssl-template.cnf:

```
cat > ~/pki/openssl-template.cnf <<'EOF'
# ~/pki/openssl-template.cnf
# Template: replace __CA_DIR__ and __CN__. SANs are appended dynamically.

[ ca ]
default_ca = ca_default

[ ca_default ]
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
copy_extensions   = copy

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
req_extensions      = req_ext

[ dn ]
C  = US
ST = Connecticut
L  = Wilton
O  = Example Org
OU = PKI
CN = __CN__

##########
# CA cert profiles
##########

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

##########
# Leaf cert profiles
##########

[ tls_server ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = serverAuth

[ tls_client ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = clientAuth

[ tls_server_client ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = serverAuth, clientAuth

[ code_signing ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = codeSigning

[ email_smime ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature, keyAgreement
extendedKeyUsage = emailProtection

[ ocsp_responder ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = OCSPSigning

[ time_stamping ]
basicConstraints = critical, CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, digitalSignature
extendedKeyUsage = timeStamping

[ req_ext ]
# The script will add "subjectAltName = @alt_names" here when SANs are present

[ alt_names ]
# dynamically generated entries go here
EOF
```

## 2) Create the leaf-config generator script

Create ~/pki/make-leaf-config.sh:

```
cat > ~/pki/make-leaf-config.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  make-leaf-config.sh --cn <CN> --out <path> --profile <profile> [--san <value> ...]
Profiles:
  tls_server
  tls_client
  tls_server_client
  code_signing
  email_smime
  ocsp_responder
  time_stamping
USAGE
}

CN=""
OUT=""
PROFILE=""
SANS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cn) CN="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --profile) PROFILE="$2"; shift 2 ;;
    --san) SANS+=("$2"); shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$CN" || -z "$OUT" || -z "$PROFILE" ]]; then
  echo "Missing required args" >&2
  usage
  exit 2
fi

# Guardrail: browser-facing TLS server certs basically require SANs
if [[ ("$PROFILE" == "tls_server" || "$PROFILE" == "tls_server_client") && ${#SANS[@]} -eq 0 ]]; then
  echo "Profile $PROFILE requires at least one --san for browser compatibility" >&2
  exit 2
fi

TEMPLATE="$HOME/pki/openssl-template.cnf"
INTERMEDIATE_DIR="$HOME/pki/intermediate"

sed \
  -e "s|__CA_DIR__|${INTERMEDIATE_DIR}|g" \
  -e "s|__CN__|${CN}|g" \
  "${TEMPLATE}" > "${OUT}"

if [[ ${#SANS[@]} -gt 0 ]]; then
  # Add SAN request to CSR extensions
  awk '
    BEGIN {in_req_ext=0}
    /^\[ *req_ext *\]$/ {print; in_req_ext=1; print "subjectAltName = @alt_names"; next}
    /^\[/ {in_req_ext=0; print; next}
    {print}
  ' "${OUT}" > "${OUT}.tmp" && mv "${OUT}.tmp" "${OUT}"
fi

dns_i=0
ip_i=0
san_lines=""

for san in "${SANS[@]}"; do
  if [[ "$san" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    ((ip_i++))
    san_lines+=$(printf "IP.%d = %s\n" "$ip_i" "$san")
  elif [[ "$san" == *:* ]]; then
    # treat as IPv6
    ((ip_i++))
    san_lines+=$(printf "IP.%d = %s\n" "$ip_i" "$san")
  else
    ((dns_i++))
    san_lines+=$(printf "DNS.%d = %s\n" "$dns_i" "$san")
  fi
done

if [[ -n "$san_lines" ]]; then
  awk -v insert="$san_lines" '
    BEGIN {printed=0}
    /^\[ *alt_names *\]$/ {
      print
      printf "%s", insert
      printed=1
      next
    }
    {print}
    END {
      if (!printed) {
        print ""
        print "[ alt_names ]"
        printf "%s", insert
      }
    }
  ' "${OUT}" > "${OUT}.tmp" && mv "${OUT}.tmp" "${OUT}"
fi

echo "PROFILE=${PROFILE}"
EOF

chmod +x ~/pki/make-leaf-config.sh
```

## 3) Create the Root CA (ECDSA P-256)

### 3a) Root key

```
openssl genpkey -algorithm EC \
  -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/root/private/ca.key.pem

chmod 400 ~/pki/root/private/ca.key.pem
```

The above will not encrypt the private key in the keyfile.  This is OK if the private keyfile will be protected by other
means, and will be helpful with automation since you will not have to supply the password every time you want to use the
private key; but - for a more secure setup - you should encrypt the key.  This command ...

```
openssl genpkey -algorithm EC \
  -aes-256-cbc \
  -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/root/private/ca.key.pem

chmod 400 ~/pki/root/private/ca.key.pem
```

... will prompt you for a password and use it to encrypt the key in the keyfile.  The password will be required every
time you want to access and use the private key.  There are various ways to inject the password during automated use in
scripts.  We won't go into that here though.

### 3b) Root self-signed cert

Create root config:

```
sed \
  -e "s|__CA_DIR__|$HOME/pki/root|g" \
  -e "s|__CN__|Example Root CA (EC)|g" \
  ~/pki/openssl-template.cnf > ~/pki/root/openssl-root.cnf
```

Issue root cert:

```
openssl req -config ~/pki/root/openssl-root.cnf \
  -new -x509 -days 3650 -sha256 \
  -key ~/pki/root/private/ca.key.pem \
  -extensions v3_root_ca \
  -out ~/pki/root/certs/ca.cert.pem

chmod 444 ~/pki/root/certs/ca.cert.pem
```

If you encrypted the root CA private key then you will be prompted for the password.

## 4) Create the Intermediate CA (ECDSA P-256), signed by Root

### 4a) Intermediate key

```
openssl genpkey -algorithm EC \
  -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/intermediate/private/ca.key.pem

chmod 400 ~/pki/intermediate/private/ca.key.pem
```

As with the root CA private key, the above will not encrypt the private key in the keyfile.  If you want to encrypt the
private key then use this command ...

```
openssl genpkey -algorithm EC \
  -aes-256-cbc \
  -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/intermediate/private/ca.key.pem

chmod 400 ~/pki/intermediate/private/ca.key.pem
```

### 4b) Intermediate CSR

Create intermediate config:

```
sed \
  -e "s|__CA_DIR__|$HOME/pki/intermediate|g" \
  -e "s|__CN__|Example Intermediate CA (EC)|g" \
  ~/pki/openssl-template.cnf > ~/pki/intermediate/openssl-intermediate.cnf
```

Create CSR:

```
openssl req -config ~/pki/intermediate/openssl-intermediate.cnf \
  -new -sha256 \
  -key ~/pki/intermediate/private/ca.key.pem \
  -out ~/pki/intermediate/csr/ca.csr.pem
```

### 4c) Sign intermediate cert with Root

```
openssl ca -batch \
  -config ~/pki/root/openssl-root.cnf \
  -extensions v3_intermediate_ca \
  -days 3650 -notext -md sha256 \
  -in ~/pki/intermediate/csr/ca.csr.pem \
  -out ~/pki/intermediate/certs/ca.cert.pem

chmod 444 ~/pki/intermediate/certs/ca.cert.pem
```

### 4d) Create CA chain file

```
cat ~/pki/intermediate/certs/ca.cert.pem \
    ~/pki/root/certs/ca.cert.pem > ~/pki/intermediate/certs/ca-chain.cert.pem

chmod 444 ~/pki/intermediate/certs/ca-chain.cert.pem
```

## 5) Issue a TLS server certificate (ECC) with N SANs

Example hostnames and IP:

* www.example.internal
* example.internal
* api.example.internal
* *192.168.1.50

### 5a) Server key

```
mkdir -p ~/pki/certs/server1

openssl genpkey -algorithm EC \
  -pkeyopt ec_paramgen_curve:P-256 \
  -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/certs/server1/server.key.pem

chmod 400 ~/pki/certs/server1/server.key.pem
```

This private key should generally not be encrypted.  It will likely be installed as part of the config of a daemon on
the server, and we want the server (and its daemons) to be able to start automatically without someone - or something -
having to enter the password to decrypt the server's private key.

### 5b) Generate per-leaf OpenSSL config with profile + SANs

```
PROFILE_LINE=$(~/pki/make-leaf-config.sh \
  --cn "www.example.internal" \
  --out ~/pki/tmp/server1.cnf \
  --profile tls_server \
  --san "www.example.internal" \
  --san "example.internal" \
  --san "api.example.internal" \
  --san "192.168.1.50")

PROFILE=${PROFILE_LINE#PROFILE=}
echo "Using profile: $PROFILE"
```

### 5c) Create CSR

```
openssl req -new -sha256 \
  -key ~/pki/certs/server1/server.key.pem \
  -config ~/pki/tmp/server1.cnf \
  -out ~/pki/csr/server1.csr.pem
```

### 5d) Sign server cert with Intermediate using the chosen profile

```
openssl ca -batch \
  -config ~/pki/intermediate/openssl-intermediate.cnf \
  -extensions "$PROFILE" \
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

### 6) Install on Linux server (nginx), TLS 1.3 only

Copy to the nginx host:
* *~/pki/certs/server1/server.key.pem
* ~/pki/certs/server1/server.cert.pem
* *~/pki/intermediate/certs/ca.cert.pem (intermediate cert)

On the nginx server:

```
sudo mkdir -p /etc/nginx/tls
sudo chmod 700 /etc/nginx/tls

sudo cp server.key.pem /etc/nginx/tls/
sudo cp server.cert.pem /etc/nginx/tls/
sudo cp ca.cert.pem /etc/nginx/tls/intermediate.cert.pem

sudo chmod 600 /etc/nginx/tls/server.key.pem
sudo chmod 644 /etc/nginx/tls/server.cert.pem /etc/nginx/tls/intermediate.cert.pem

sudo bash -c 'cat /etc/nginx/tls/server.cert.pem /etc/nginx/tls/intermediate.cert.pem > /etc/nginx/tls/fullchain.pem'
sudo chmod 644 /etc/nginx/tls/fullchain.pem
```

nginx site config:

```
server {
    listen 443 ssl;
    server_name www.example.internal example.internal api.example.internal;

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

## 7) Install on Windows Server (IIS) using PFX

### 7a) Create PFX on Linux

```
openssl pkcs12 -export \
  -out ~/pki/certs/server1/server1-ec.pfx \
  -inkey ~/pki/certs/server1/server.key.pem \
  -in ~/pki/certs/server1/server.cert.pem \
  -certfile ~/pki/intermediate/certs/ca.cert.pem
```

### 7b) Import into LocalMachine personal store

On Windows Server (PowerShell as admin):

```
$pwd = Read-Host -AsSecureString
Import-PfxCertificate -FilePath C:\path\server1-ec.pfx -CertStoreLocation Cert:\LocalMachine\My -Password $pwd
```

If needed, import the intermediate cert into: Local Machine / Intermediate Certification Authorities

Then bind in IIS:

IIS Manager / Site / Bindings ... / https :443 / select certificate

## 8) Install Root CA trust on Linux clients

Debian or Ubuntu:

```
sudo cp ~/pki/root/certs/ca.cert.pem /usr/local/share/ca-certificates/example-root-ec.crt
sudo update-ca-certificates
```

RHEL or Fedora:

```
sudo cp ~/pki/root/certs/ca.cert.pem /etc/pki/ca-trust/source/anchors/example-root-ec.crt
sudo update-ca-trust
```

## 9) Install Root CA trust on Windows clients

Convert root to DER:

```
openssl x509 -in ~/pki/root/certs/ca.cert.pem -outform der -out ~/pki/root/certs/root-ec.cer
```

Import into Trusted Root store:

```
Import-Certificate -FilePath C:\path\root-ec.cer -CertStoreLocation Cert:\LocalMachine\Root
```

## 10) Optional: issuing other cert types with the same recipe

The only differences are:

* Which profile you pick
* Whether you provide SANs

Example: issue an mTLS client cert

```
mkdir -p ~/pki/certs/client01
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -pkeyopt ec_param_enc:named_curve \
  -out ~/pki/certs/client01/client.key.pem

PROFILE_LINE=$(~/pki/make-leaf-config.sh \
  --cn "client01" \
  --out ~/pki/tmp/client01.cnf \
  --profile tls_client)

PROFILE=${PROFILE_LINE#PROFILE=}

openssl req -new -sha256 \
  -key ~/pki/certs/client01/client.key.pem \
  -config ~/pki/tmp/client01.cnf \
  -out ~/pki/csr/client01.csr.pem

openssl ca -config ~/pki/intermediate/openssl-intermediate.cnf \
  -extensions "$PROFILE" \
  -days 397 -notext -md sha256 \
  -in ~/pki/csr/client01.csr.pem \
  -out ~/pki/certs/client01/client.cert.pem
```
