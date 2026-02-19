---
layout: post
title: On Digital Certificates
sub_title: And how they actually work
featured_image: /images/swimming_certificate.png
featured_image_alt_text: "Swimming Certificate"
featured_image_title: "Achieved without water wings too!"
featured_image_width: 550
featured_image_link: https://www.youtube.com/watch?v=mxnUrCNnzNA
tags: [compsci]
---

# Introduction

It is often said that the best way to learn something is to teach it to someone else, better yet to write documentation
about it.  There's something about the act of writing - structuring a document to present the necessary information -
that serves to embed the understanding of something deeply in one's brain.

Digital Certificates, tokens that are used as part of various security processes in information systems, are perhaps
passingly familiar to users of such information systems - "they're something to do with the little padlock icon next to
the URL in my browser" or "it's when the website starts with https instead of http" - but what are they really and how
do they function as part various security processes?

I use certificates all the time as part of my work but, until recently, I've never taken the time to really learn all of
the details of how they are issued, trusted, potentially revoked, interpreted and verified.  In order to better cement
my knowledge I have taken it upon myself to document my learnings; and this, dear reader, is the result of that
commitment.  Let's go.

# What is a certificate?

A dictionary will probably describe a certificate as an official document attesting to a fact, and that is basically all
there is to say about it.  We may want to ask other questions though: Exactly what is the fact that the certificate
attests to?  Can I trust that the certificate is genuine?  Who issued it?  Do I trust the issuer?  What do I do with it?

# What is a digital certificate?

A digital certificate is a structured data object that:

* Binds an identity to a public key
* Is digitally signed by a trusted authority
* Can be independently verified by anyone who trusts that authority

It is a claim, backed by a signature, that says: "This public key belongs to this identity, and I vouch for that"

# What are digital certificates used for?

Certificates can be used to facilite the following high level concepts ...

* Authentication - Verifying that things are who they claim to be
* Integrity - Verifying that something has not been altered
* The secure exchange of keys for encryption
* Non-repudiation - Via digital signatures

Some specific examples ...

* Securing websites via HTTPS/TLS.  The server certificate authenticates the server's identity and enables secure
  communication.
* Code signing.  Software publishers use certificates to sign binaries, prove who authored them and to ensure that they
  have not been tampered with.
* Secure Email (S/MIME).  Certificates allow the signing of email to prove sender identity and facilitate the encryption
  of email to specific recipients.
* Client authentication.  The client certificate authenticates the client's identity: Mutual TLS (mTLS), smart cards,
  enterprise WiFi (EAP-TLS).
* VPN and Network Security.  Authentication to VPN gateways, securing site to site tunnels.
* Device Identity (IoT).
* Document Signing.  

Digital certificates are but a part of the broader concept of [Public Key Infrastructure
(PKI)](https://en.wikipedia.org/wiki/Public_key_infrastructure).  They fundamentally rely on the concept of public key
cryptography, which I wrote another primer blog post on [here]({{ site.baseurl }}{% post_url
2026-02-18-on-public-key-cryptography %}).

# Are certificates standardized?

A digital certificate is governed by the [X.509](https://en.wikipedia.org/wiki/X.509) standard.

X.509 defines:

* The certificate data model
* Mandatory and optional fields
* Extension semantics
* How certificates are signed and verified
* How trust chains are constructed

It is maintained by [ITU-T](https://en.wikipedia.org/wiki/ITU-T), with profiles refined by the
[IETF](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force) for internet use.  When people talk about
"SSL certificates" or "TLS certificates", they are almost always talking about X.509 certificates used within
[TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

* TLS - Transport Layer Security - The modern secure successor to SSL
* SSL - Secure Sockets Layer - An earlier, now deprecated, standard for secure communications over networks

The X.509 standard matters because once everyone agrees to follow it, you get interoperability:

* A browser written by one company can validate a certificate issued by another
* A Linux server can trust a Windows-issued certificate
* A device can verify a chain it has never seen before

Without a strict standard, none of that works.

# What does a digital certificate contain?

A typical certificate contains these fields ...

| Field | Description |
|-------|-------------|
| Subject | Who or what the certificate represents (a person, a server, a service, a device) |
| Public Key | The cryptographic key being bound to that identity |
| Issuer | Who issued and signed the certificate |
| Validity Period | Start and end dates |
| Serial Number | A unique identifier assigned by the issuer |
| Extensions | Machine-readable constraints and metadata describing what the certificate may be used for |
| Digital Signature | A cryptographic signature covering all the above fields |

Everything except the signature is just structured fields, the signature is what stops tampering.

# How are certificates structured?

They are structured according to the [ASN.1](https://en.wikipedia.org/wiki/ASN.1) (Abstract Syntax Notation One)
standard and then encoded into bytes according to the [DER](https://en.wikipedia.org/wiki/X.690#DER_encoding)
(Distinguished Encoding Rules) standard.  The net result is a byte stream which can be written directly to a file or,
optionally, base64 encoded and then written to a file.  In this latter case the resulting text file uses the
[PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format.

Certificates look opaque and unfriendly when viewed raw.  They are binary blobs, not text-first.

You may encounter certificate, and related, files with different extensions.  The extension often, but not always,
indicates the contents.

| Extension | Typical Contents | Notes |
|-----------|------------------|-------|
| *.crt, *.cer | A certificate | Does not usually contain the associated private key |
| *.key | A private key | Usually associated with the certificate in a corresponding .crt or .cer file |
| *.pem | A PEM encoded container | Could contain either a certificate or a private key or both |
| *.pfx, *.p12 | A [PKCS#12](https://en.wikipedia.org/wiki/PKCS_12) bundle | This is more commonly used in Windows rather than Linux |

You may also encounter files with other extensions (e.g. *.csr).  These do not contain certificates/keys, rather they
contain "certificate signing requests" (specs for certificates to be signed by a Certificate Authority).  We will
discuss this process later.

Different environments tend to favor different conventions.  In Windows you will more commonly encounter .pfx files,
whereas in Linux you will more commonly encounter separate .crt and .key files.

Personally I prefer to use .pem files for everything and rely on the filename to describe the actual contents.

# Tools for creating/managing certificates?

The most common framwork is the open source library [OpenSSL](https://en.wikipedia.org/wiki/OpenSSL) and its command
line tool [openssl](https://wiki.openssl.org/index.php/Command_Line_Utilities).

If you are on Linux then openssl will most likely already be installed.  If not then you should be able to install it
manually via your distro's package manager (e.g. `sudo apt install openssl`).  You can always build the latest version
from [source](https://github.com/openssl/openssl) of course.
[Windows builds](https://github.com/openssl/openssl/blob/master/NOTES-WINDOWS.md) are supported or you can find and
download prebuilt binaries from sources like [this](https://slproweb.com/products/Win32OpenSSL.html).

# How to create/use certificates?

Before we can talk about the specifics of how to create a certificate we first need to think about the overall
environment within which the certificate will be used, i.e. PKI as mentioned above.  Various components need to be setup
and put in place in order for certificates to function.

# Setting up a basic PKI

For a minimal use case (a client connecting securely to a server), conceptually we have three entities ...

* A certificate authority (CA).  Something that issues and signs certificates and via which clients can verify
  certificates.
* A web server that supports HTTPS/TLS
* A client using a browser that supports HTTPS/TLS and has been configured to trust the certificate authority

First the server needs to be issued a certificate by the certificate authority.

```
[Certificate Authority (CA)]
       |
  Signs and issues server cert
       |
       v
[Server] + {Server cert: server info + signature}
```

And the client needs to be configured to trust the certificate authority.

When the client initiates a connection to the server, it is sent the server's certificate which it then verifies via
the Certificate Authority whom it trusts.  If the certificate is verified as correct then the client can trust the
server's identity and proceed to transact with it.

```
[Certificate Authority (CA)]

[Client Browser] - Trusts CA
  |                      ^                                                ^
  |                      |               Verify server cert with CA       |
Connection handshake   {Server cert}                                   Key exchange and
  |                      |                                             secure channel established
  |                      |                                                |
  v                      |                                                v
[Server] + {Server cert}
```

# Certificate authorities

How does a browser actually validate a server certificate against its issuing certificate authority?  This is actually
done via the use of a digital certificate issued by the CA, that is installed in - and implicitly trusted by - the
operating system that the browser is running on.  These trusted CA certs are called Root CA certs.  For a server cert to
be valid it must be signed by a Root CA or a CA that is part of a chain of trust (each cert signed by another CA) that
leads back to a Root CA.

But how do these CA certs get pre-installed in an OS?  There is a whole business ecosystem for this.  Many companies act
as certificate authorities and participate in programs sponsored by OS vendors and industry groups.  CAs have to meet
various standards to be included in the Root CA stores of base OS distributions.  The list of vetted CAs is a changing
landscape and you can always find lists of current trusted Root CAs in various online documents.  Or you can look in
your OS to find them.  These public Root CAs are businesses and charge people for issuing server certs, the value being
that such certs will be trusted by base OS installations.  Relatively recently some non-profit public Root CAs have come
along (e.g. [letsencrypt.org](https://letsencrypt.org/how-it-works/)) that support the idea of certs that can be issued
and updated programmatically via API according to the
[ACME](https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment) protocol.

In Windows you need to run the certlm.msc and certmgr.msc apps.  The former shows certificates installed for use by the
local machine and the latter by the current user.  You will various sections but the Trusted Root Cerificaiton
Authorities section will show all of the currently installed Root CA certs under its Certificates folder.  There will be
a lot of them.  Most will be for public Root CAs and will be pre-installed by Microsoft, but if you are using a computer
in a corporate environment then there will most likely be additional installed Root CA certs for the PKI in place as
part of the company's network.  On Windows this is typically achieved via [Active Directory Group
Policy](https://en.wikipedia.org/wiki/Group_Policy).

In Linux (e.g. Ubuntu/Debian) the trusted Root CA certs live under /etc/ssl/certs/.  There will be a large bundle file
named ca-certificates.crt that contains a concatentated set of CA certs.  There may also be individual PEM encoded CA
cert files.  In addition, Root CA certs can also be installed in /usr/share/ca-certificates/ (distro provided certs) or
/usr/local/share/ca-certificates/ (local admin provided certs).  The last location is where local company network Root
CA certs will typically be installed.  In Linux this will be likely achieved via some kind of automation.

# Intermediate certificate authorities

I mentioned above that a server cert might be signed by a CA that is not a Root CA.  This is common and such CAs are
known as Intermediate CAs.  They exist in order to make it easier to manage the lifecycle of issued certificates and
support the occassional need to revoke certificates or whole sets of previously issued certificates.  This gets into the
weeds of PKI policy/managment and I can't comment on all the details here.  You will be able to find various articles
and docs about this online.  Here's [one](https://www.thesslstore.com/blog/root-certificates-intermediate/) that I
found.  All we really need to know now is that it's common practice to use a Root CA cert to issue/sign various
intermediate CA certs that are then used to issue/sign individual certs for actual use in securing endpoints.

# A basic PKI setup

Managing PKI across an enterprise is a daunting a complex task and there are whole sectors of companies that sell
product suites to help implement and manage PKI.  For a small setup though, you can do it all yourself just using
OpenSSL.  I document such a basic setup [here]({{ site.baseurl }}/faqs/openssl-pki/).

# SSL/TLS

I mentioned before that SSL is an older term, and an older protocol, and that TLS is the correct term of art for the
more modern protocol that superceded it.  There have actually been multiple versions of TLS too.

## The SSL era

### SSL 1.0 (early 1990s, never released)

The first version was developed by Netscape.  It had serious security flaws and was never publicly deployed. It mainly
proved the concept: encrypt HTTP over TCP using public-key cryptography.

### SSL 2.0 (1995)

This was the first public release, although it did still have some major design weaknesses.

* Weak MAC construction
* No handshake protection
* Vulnerable to downgrade attacks
* Poor cipher negotiation

It was quickly shown to be insecure and formally deprecated years later.

### SSL 3.0 (1996)

This was a complete redesign that introduced ...

* Proper handshake protocol
* Cipher suite negotiation
* Better key derivation
* More robust MAC construction
* Became widely deployed on the early web

But it still had structural weaknesses. In 2014, the POODLE attack showed fundamental issues in its padding design. It
is now considered insecure.

## Transition to TLS

In 1999, the IETF took over standardization from Netscape.  SSL was renamed and standardized as TLS.

### TLS 1.0 (1999)

Defined in [RFC 2246](https://datatracker.ietf.org/doc/html/rfc2246).  Thiw was based heavily on SSL 3.0 but with
improvements.

* HMAC replaces SSL’s custom MAC
* More formal key derivation
* Better specification clarity
* Still used:
* RSA key exchange
* CBC block ciphers
* SHA-1

It was mostly SSL 3.0 cleaned up and standardized.

### TLS 1.1 (2006)

Defined in [RFC 4346](https://datatracker.ietf.org/doc/html/rfc4346).  This was largely defensive maintenance with
incremental security hardening.

* Fixed CBC initialization vector (IV) weaknesses
* Added protection against padding oracle attacks
* Clarified error handling

### TLS 1.2 (2008)

Defined in [RFC 5246](https://datatracker.ietf.org/doc/html/rfc5246).  This was a major improvement and became dominant
for over a decade.

Key Changes:

* Allowed use of SHA-256 and stronger hash functions
* Introduced AEAD cipher support (e.g. AES-GCM)
* Detached PRF from SHA-1
* Better cipher suite flexibility
* Enabled elliptic curve cryptography (ECDHE)

TLS 1.2 mattered because it enabled forward secrecy (via ECDHE), stronger symmetric encryption and the removal of the
reliance on MD5/SHA-1.  Most modern systems ran TLS 1.2 until TLS 1.3 became mainstream.

## TLS 1.3 (2018)

Defined in [RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446).  This was not incremental, it was a simplification
and security overhaul.  The new major design philosophy was to remove legacy and insecure options, to encrypt more of
the handshake and to make connections faster.

### What Was Removed:

* RSA key exchange (no more static RSA)
* All CBC ciphers
* RC4
* MD5
* SHA-1 for handshake
* Renegotiation
* Compression
* Custom PRFs

### What was added / changed

* Mandatory Forward Secrecy - Only ephemeral Diffie-Hellman (usually ECDHE) is allowed.  There is no more static key
  exchange.
* Faster Handshake (a massive performance improvement) - TLS 1.2: 2 round trips; TLS 1.3: 1 round trip an optional 0-RTT
  resumption
* Encrypted Handshake - Most of the handshake is now encrypted.  In TLS 1.2, much of it was visible in plaintext.
* Simplified Cipher Suites - Key exchange and authentication are now separated.  In TLS 1.2 cipher suites encoded: key
  exchange, authentication, symmetric cipher and hash.  In TLS 1.3 cipher suites only define: symmetric cipher, AEAD
  mode and hash
* HKDF Key Schedule - TLS 1.3 uses HKDF (HMAC-based Key Derivation Function) for clean, provable key derivation. This
was a formal cryptographic improvement.
