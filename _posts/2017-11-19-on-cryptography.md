---
layout: post
title: "On Cryptography"
sub_title: ""
featured_image: /images/cryptography.png
featured_image_alt_text: "On Cryptography"
featured_image_title: >
  Actual actual reality: nobody cares about his secrets.  (Also, I would be hard-pressed to find that wrench for $5.)
featured_image_width: 450
---

In the beginning was the word and [the word was good](https://www.youtube.com/watch?v=NAdz7ZxLXTc&t=17).  In fact the
word was so good that bad guys wanted to steal it and so the word had to wear shades and a wig to go out in public.  And
thusly crypography was born.

# Demo

<script>
window.onload = function init(event) {
    console.log("init");
    var btn = document.getElementById("btn");
    btn.innerHTML = "Encrypt >";
    btn.onclick = function() { encrypt(btn); };
}

function rot13(input) {
    var output = input.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    });
    return output;
}
function encrypt(btn)
{
    console.log("encrypt");
    var plaintext = document.getElementById("plaintext");
    var ciphertext = document.getElementById("ciphertext");
    ciphertext.value = rot13(plaintext.value);
    plaintext.value = "";
    plaintext.disabled = true;
    btn.onclick = function() { decrypt(this); };
    btn.innerHTML = "< Decrypt";
}
function decrypt(btn)
{
    console.log("decrypt");
    var plaintext = document.getElementById("plaintext");
    var ciphertext = document.getElementById("ciphertext");
    plaintext.value = rot13(ciphertext.value);
    ciphertext.value = "";
    plaintext.disabled = false;
    btn.onclick = function() { encrypt(this); };
    btn.innerHTML = "Encrypt >";
}
</script>

<style>
  #demo {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
  }

  #plaintext-label {
    grid-row: 1;
    grid-column: 1;
    margin: 0;
  }

  #ciphertext-label {
    grid-row: 1;
    grid-column: 3;
    margin: 0;
  }

  #plaintext {
    grid-row: 2;
    grid-column: 1;
  }

  #btn {
    grid-row: 2;
    grid-column: 2;
    width: max-content;
    height: max-content;
    margin: auto;
  }

  #ciphertext {
    grid-row: 2;
    grid-column: 3;
  }
</style>

<div id="demo">
<p id="plaintext-label">Plaintext</p>
<p id="ciphertext-label">Ciphertext</p>
<textarea id="plaintext" rows="3" cols="30" style="resize:none"></textarea>
<button id="btn"></button>
<textarea id="ciphertext" rows="3" cols="30" style="resize:none" readonly="true"></textarea>
</div>

# Public Key Cryptography



![Locked - Unlocked - Locked](/images/locked_unlocked_locked.jpg)