import { convertDomSectionsToDataStructure } from "./Exporter";
import { Importer } from "./Importer";

export function splitPositionForHtmlLikePlainText(html, pos) {
    let chars = html.split('');
    let isInsideTag = false;
    let isInsideHtmlEntity = false;
    let plainTextCharsCount = 0;
    let actualSplitAt = null;
    for (let i = 0; i <= chars.length; i++) {
        let char = chars[i];
        if (isInsideTag) {
            if (char === '>') {
                isInsideTag = false
            }
            continue;
        }

        if (isInsideHtmlEntity) {
            if (char === ';') {
                isInsideHtmlEntity = false
            }
            continue;
        }

        let prev = chars[i - 1];
        let isNotEscaped = prev !== `\\`;

        if (isNotEscaped && char === '<') {
            isInsideTag = true;
            continue;
        }

        if (isNotEscaped && char === '&') {
            isInsideHtmlEntity = true;
            if (chars.slice(i, i + 6).join('') === '&nbsp;') {
                // counts as space
                plainTextCharsCount++;
            }
            continue;
        }
        plainTextCharsCount++;
        if (plainTextCharsCount >= pos) {
            actualSplitAt = i;
            break;
        }
    }
    return actualSplitAt + 1;
}

export function removeWordWrap(text, maxLength = null) {
    if (!maxLength) {
        // detect max length
        maxLength = text.split(`\n`).map(l => l.length).reduce((a, b) => a < b ? b : a)
    }
    let lines = text.split(`\n`)
    let clearedText = [];
    let lineCount = 0;
    for (let i = 0; i < text.length; i++) {
        let currentCharIsNewLine = text[i] === `\n`
        if (currentCharIsNewLine) {
            lineCount++;
        }
        let nextWord = lines[lineCount].split(' ')[0];
        if (currentCharIsNewLine && nextWord && i > 0) {
            if (!lines[lineCount - 1].trim().match(/[\?\!|.]$/) || lines[lineCount - 1].trim().length + 1 + nextWord.length <= maxLength) {
                // remove linebreak
                if (!lines[lineCount - 1].match(/\s$/)) {
                    // use a whitespace instead 
                    clearedText.push(' ');
                }
                continue;
            }
        }
        clearedText.push(text[i]);
    }
    return clearedText.join('');
}

export function getCursorPosition(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection !== "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

export function stripHTMLTags(html) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText;
}

export function moveCursor(el, position) {
    try {
        moveCursorToPosition(el, position);
    } catch (e) {
        if (!e.message.match(/offset/) && !e.message.match(/allowed range/)) {
            throw e;
        }
        let savePos = el.textContent;
        moveCursorToPosition(el, savePos);
    }
}

// https://geraintluff.github.io/sha256/
/* Please do only use for non-security-related issues; use window.crypto.subtle.digest('SHA-256') instead */
export function sha256Hash(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    };

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = [];
    var primeCounter = k[lengthProperty];
    /*/
    var hash = [], k = [];
    var primeCounter = 0;
    //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return; // ASCII check: only accept characters in range 0-255
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength)

    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                + ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                + k[i]
                // Expand the message schedule if needed
                + (w[i] = (i < 16) ? w[i] : (
                    w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                ) | 0
                );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

            hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }
    return result;
};

export function moveCursorToEnd(el) {
    moveCursor(el, el.textContent?.length)
}

export function loadJSONDataToLocalStorage({ sections, metaData } = {}) {
    localStorage.setItem('currentScreenplay', JSON.stringify({
        sections: sections.map(s => {
            return {
                classification: s.classification,
                html: s.html,
            }
        }),
        // TODO: only allow specific fields / value?
        metaData: { ...metaData }
    }));
}

export function loadPlainTextToLocalStorage(text) {
    let data = Importer(text.replace(/\t/g, '    '));
    localStorage.setItem('currentScreenplay', JSON.stringify(data));
    return data;
}

export function resetDocument({ setSeed, setMetaData }) {
    setSeed(Math.random())
    localStorage.setItem('currentScreenplay', '{}');
    localStorage.setItem('mementos', '[]');
    localStorage.setItem('lastIndexOfCurrent', 0);
    localStorage.setItem('lastImportFile', '');
    setMetaData({})
}

export function sectionsFromDocument() {
    return convertDomSectionsToDataStructure([...document.querySelectorAll('#screenwriter-editor > section > div.edit-field')]);
}

function moveCursorToPosition(el, position) {
    // DOMException: Failed to execute 'setStart' on 'Range': The offset 220 is larger than the node's length (78)
    let range = document.createRange();
    let selection = window.getSelection();
    range.selectNodeContents(el);
    range.setStart(el.firstChild, position);
    range.setEnd(el.firstChild, position);
    selection.removeAllRanges();
    selection.addRange(range);
}

export function basenameOfPath(str) {
    let li = Math.max(str.lastIndexOf('/'), str.lastIndexOf('\\'));
    return new String(str).substring(li + 1);
}
