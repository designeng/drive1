// RSA, a suite of routines for performing RSA public-key computations in
// JavaScript.
//
// Requires BigInt.js and Barrett.js.
//
// Copyright 1998-2005 David Shapiro.
//
// You may use, re-use, abuse, copy, and modify this code to your liking, but
// please keep this header.
//
// Thanks!
//
// Dave Shapiro
// dave@ohdave.com
//
// Modified for PKCS#1 v1.5 (RFC 2313) compatibility by Aristarkh Zagorodnikov (xm-rsa971@x-infinity.com)

goog.provide('rsa');


function RSAKey(encryptionExponent, modulus) {
    this.e = biFromHex(encryptionExponent);
    this.m = biFromHex(modulus);
    this.digitSize = 2 * biHighIndex(this.m) + 2;
    this.chunkSize = this.digitSize - 11;
    this.barrett = new BarrettMu(this.m);
}

function encryptedString(key, s) {
    var a = new Array();
    var sl = s.length;
    var i = 0;
    var ii = 0;

    while (ii < sl) {
        var c = s.charCodeAt(ii++);
        if (c < 128) {
            a[i++] = c;
        }
        else if ((c > 127) && (c < 2048)) {
            a[i++] = (c >> 6) | 192;
            a[i++] = (c & 63) | 128;
        }
        else {
            a[i++] = (c >> 12) | 224;
            a[i++] = ((c >> 6) & 63) | 128;
            a[i++] = (c & 63) | 128;
        }
    }

    var al = a.length;
    var result = '';
    var j, k, block;
    for (i = 0; i < al; i += key.chunkSize) {
        block = new BigInt();
        j = 0;
        var x;
        var msgLength = (i + key.chunkSize) > al ? al % key.chunkSize : key.chunkSize;
        var b = new Array();
        for (x = 0; x < msgLength; x++) {
            b[x] = a[i + msgLength - 1 - x];
        }
        b[msgLength] = 0;
        var paddedSize = Math.max(8, key.digitSize - 3 - msgLength);
        for (x = 0; x < paddedSize; x++) {
            b[msgLength + 1 + x] = Math.floor(Math.random() * 254) + 1;
        }
        b[key.digitSize - 2] = 2;
        b[key.digitSize - 1] = 0;
        for (k = 0; k < key.digitSize; ++j) {
            block.digits[j] = b[k++];
            block.digits[j] += b[k++] << 8;
        }
        var crypt = key.barrett.powMod(block, key.e);
        if (result.length)
            result += ' ';
        result += biToHex(crypt);
    }
    return result;
}


/**
 * @param {string} encryptionExponent
 * @param {string} modulus
 * @param {string} s
 * @return {string}
 */
rsa.encrypt = function(encryptionExponent, modulus, s) {
    setMaxDigits((modulus.length >> 1) + 2);
    var rsakey = new RSAKey(encryptionExponent, modulus);
    return encryptedString(rsakey, s);
};


goog.exportSymbol('rsa.encrypt', rsa.encrypt);
