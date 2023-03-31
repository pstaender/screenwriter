import Voca from "voca";

export function ExportSections(sections) {
    return Exporter(
        convertDomSectionsToDataStructure(sections)
    );
}

export function convertDomSectionsToDataStructure(sections) {
    return [...sections].map(el => {
        let classification = 'description';
        if (el.classList.contains('dialogCharacter')) {
            classification = 'dialogCharacter';
        } else if (el.classList.contains('dialogText')) {
            classification = 'dialogText';
        } else if (el.classList.contains('descriptionAnnotation')) {
            classification = 'descriptionAnnotation';
        }
        return {
            html: el.innerHTML,
            classification,
        };
    })
}

export function Exporter(sections, metaData = {}) {

    const dialogCharSpace = 22;
    const dialogSpace = 11;
    const overallSpace = 61;

    let metaDataText = [];

    if (Object.keys(metaData).length > 0) {
        let maxKeyLength = Object.keys(metaData).map(t => t.length).reduce((a,b) => a > b ? a : b)
        for(let k in metaData) {
            let key = `${k.trim()}:`
            if (metaData[k].trim() === '') {
                continue;
            }
            metaDataText.push(Voca.padRight(key, maxKeyLength + 2) + metaData[k].trim());
        }
    }
    
    metaDataText = metaDataText.length > 0 ? metaDataText.join(`\n`) + `\n` : '';

    let parts = [...sections].map(section => {
        let text = section.html.replace(/<br>/ig, `\n`).replace(/\&nbsp;/g, ' ').trim();
        if (section.classification === 'dialogCharacter') {
            text = `\n` + text.split(`\n`).map(l => {
                return Voca.wordWrap(l.toUpperCase().trim(), {
                    width: overallSpace - dialogCharSpace,
                    indent: Array(dialogCharSpace).join(' ')
                })
            }).join(`\n`)

        }
        else if (section.classification === 'dialogText') {
            text = text.split(`\n`).map(l => {
                return Voca.wordWrap(l.trim(), {
                    width: 33,
                    indent: Array(dialogSpace).join(' ')
                })
            }).join(`\n`)
        }
        else if (section.classification === 'descriptionAnnotation') {
            text = `\n` + Voca.padLeft(text.toUpperCase().trim(), overallSpace - text.length, ' ')
        } else {
            // description
            if (!text.trim()) {
                return `\n`;
            }

            text = `\n` + text.split(`\n`).map(l => {
                return Voca.wordWrap(l.trim(), {
                    width: overallSpace,
                })
            }).join(`\n`)

            // text = `\n` + text.trim() + `\n`
        }
        return text;
    })
    return metaDataText + parts.join(`\n`);
}
