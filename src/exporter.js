
import Voca from "voca";

const headerIntro = `+===========================================================+`;
const poweredBy = `\n+=                Powered by Screenwriter                  =+\n`;


export function exporter(sections) {

   
    const dialogCharSpace = 22;
    const dialogSpace = 11;
    const overallSpace = headerIntro.length;

    let parts = [...sections].map(el => {
        let text = el.innerHTML.replace(/<br>/ig, `\n`).replace(/\&nbsp;/g, ' ').trim();
        if (el.classList.contains('dialogCharacter')) {

            text = `\n` + Voca.wordWrap(text, {
                width: overallSpace - dialogCharSpace,
                indent: Array(dialogCharSpace).join(' ')
            })

        }
        else if (el.classList.contains('dialogText')) {
            text = `\n` + Voca.wordWrap(text, {
                width: 33,
                indent: Array(dialogSpace).join(' ')
            }) + `\n`
        }
        else if (el.classList.contains('descriptionAnnotation')) {
            text = `\n` + Voca.padLeft(text, overallSpace - text.length, ' ')
        } else {
            // description
            if (!text.trim()) {
                return `\n`;
            }
            text = `\n` + Voca.wordWrap(text.trim(), {
                width: overallSpace,
                // cut: true
            }) + `\n`
        }
        return text;
    })
    return headerIntro + poweredBy + headerIntro + `\n\n` + parts.join(`\n`);
}

export function importer(str) {
    let parts = str.split(`\n`).filter(l => {
        return !l.match(/^\+\=+?.*?\=\+$/);
    }).join(`\n`).replace(/^\n+/, '').replace(/\n+$/, '').split(`\n\n`)
    let sections = [];
    let i = 0;
    for (let part of parts) {
        part = part.replace(/^\n+/, '')
        if (/^\s{6,16}[A-Z]+/.test(part)) {
            sections.push({
                text: part,
                classification: 'dialogText'
            })
        }
        else if (/^\s{17,25}[A-Z]+/.test(part)) {
            sections.push({
                text: part,
                classification: 'dialogCharacter'
            })
        }
        else if (/^\s{26,}[A-Z]+/.test(part)) {
            sections.push({
                text: part,
                classification: 'descriptionAnnotation'
            })
        } else {
            // append
            if (sections.at(-1)?.className === 'description') {
                sections.at(-1).text += `\n` + part;
            } else {
                sections.push({
                    text: part,
                    classification: 'description'
                })
            }
        }
        i++;
    }
    sections = sections.map(s => {
        s.html = s.text.replace(/\n\n/, '<br><br>').split(`\n`).map(l => l.trim().replace('  ', ' &nbsp;')).join('<br>')
        return s;
    })
    return sections;
}
