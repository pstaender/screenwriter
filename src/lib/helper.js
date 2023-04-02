
export function removeWordWrap(text, maxLength = null) {
    if (!maxLength) {
        // detect max length
        maxLength = text.split(`\n`).map(l => l.length).reduce((a,b) => a < b ? b : a )
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

export function getCaretCharacterOffsetWithin(element) {
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
