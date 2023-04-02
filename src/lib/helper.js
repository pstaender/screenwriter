
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
