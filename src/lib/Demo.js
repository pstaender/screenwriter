import { moveCursorToEnd } from "./helper";

let originalText = `// Screenwriter Demo Play

[transition]// by Philipp Staender

[pause] 

INT. LATE EVENING. HOME OFFICE.

The AUTHOR sits at the desk. It was a long day - full of ideas and impressions.

The AUTHOR wants to write down a draft of an idea that came up while sitting at a COFFEE BAR downtown.

[character]Author

[parenthetical]exhausted

[dialog]Why is screenplay writing software complex and expensive? 

[transition]FADE TO:

The COMPUTER wakes up. Its screen turns from dark black into bright white. The screen pivots to the direction of the AUTHOR. 

[character]COMPUTER

[parenthetical]to AUTHOR

[dialog]Maybe you have worked with the wrong software all along…


[character]AUTHOR

[parenthetical]bugged

[dialog]Pff, what do you know…


[character]COMPUTER

[dialog]I'm just seeing a tired author. A person looking a picture of misery.


[character]AUTHOR

[dialog]Yeah…

[dialog]So… what do you recommend?


[character]COMPUTER

[dialog]Use a small and simple software for writing.

[dialog]A software, that provides actual value to your work.

[dialog]Don't let your creativity be disrupted by unneeded features - be able to write your story fast and focused.


The AUTHOR smiles. He now realises, that he is already looking at a software which might be capable of these challanges.

### Features of Screenwriter

[pause] ★ Import and Export of plain text

[pause] ★ Focus Mode

[pause] ★ Dark Mode

[pause] ★ Autosave

[pause] ★ Editing classifications for characters, dialogs, descriptions etc.

[pause] ★ free and open source

[pause] ★ runs in modern browsers

[pause] ★ export as pdf/print

[pause] ★ Optional: auto-suggestions for characters and scene description

[transition]THE END

To view the printable version, hit (⌘/CTRL + P)


`.trim().replace(/\n{3,}/g,`\n\n`)

let text = originalText.split(`\n\n`);
let chars = null;
let cssClass = '';
let pauseForIntervals = [];


let keywordsToClick = {
    ' ★ Focus Mode': '.icons .icon[data-help*="Focus Mode"]',
    ' ★ Dark Mode': '.icons .icon[data-help*="Focus Mode"], .icons .icon[data-help="Dark Mode"]',
    ' ★ Autosave': '.icons .icon[data-help="Dark Mode"]'
}

export async function ScreenwriterDemo({appendNewSection, sections}) {
    if (!text || (text.length === 0 && chars.length === 0)) {
        return;
    }
    if (pauseForIntervals.pop()) {
        return;
    }
    let field = document.querySelector('#screenwriter-editor > section:last-of-type > .edit-field');

    if ((!chars || chars.length === 0)) {
        // next section
        ((cssClass) => {
            setTimeout(() => {
                if (!cssClass) {
                    return
                }
                // do some manual cleanup
                field.parentElement.classList.remove('description')
                field.parentElement.classList.remove('selected')
                
            }, 100)
        })(cssClass)
        cssClass = '';
        appendNewSection(sections);
        pauseForIntervals = [...Array(10)].map(() => true)
        chars = text.shift()
        if (chars !== undefined) {
            let parts = null;
            if (parts = chars.match(/^\[(.+?)\](.*)$/)) {
                if (parts[1] && parts[2]) {
                    if (parts[1] === '[pause]') {
                        pauseForIntervals = [...Array(30)].map(() => true)
                    }
                    chars = parts[2]
                    if (parts[1] !== 'pause') {
                        cssClass = parts[1];
                    }
                }
            }
            if (keywordsToClick[chars]) {
                [...document.querySelectorAll(keywordsToClick[chars])].forEach(el => el.click())                
                pauseForIntervals = [...Array(30)].map(() => true)
            }
            chars = chars.split('')
        } 
        return
    }
    let char = chars.shift()
    if (char === undefined) {
        return;
    }
    field.innerHTML += char
    if (cssClass) {
        field.classList.add(cssClass)
        field.parentElement.classList.add(cssClass)
    }
    field.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    moveCursorToEnd(field)
}
