import Voca from "voca";


export function ExportSections(sections) {
    return Exporter(
        convertDomSectionsToDataStructure(sections)
    );
}

export function convertDomSectionsToDataStructure(sections) {
    return [...sections].map(el => {
        let classification = 'description';
        if (el.classList.contains('character')) {
            classification = 'character';
        } else if (el.classList.contains('dialog')) {
            classification = 'dialog';
        } else if (el.classList.contains('transition')) {
            classification = 'transition';
        } else if (el.classList.contains('parenthetical')) {
            classification = 'parenthetical';
        }
        return {
            html: el.innerHTML,
            classification,
            id: el.dataset.id,
        };
    })
}

export function Exporter(sections, metaData = {}) {

    let options = {
        spacesCharacter: 22,
        spacesDialog: 11,
        documentWidth: 61,
        dialogWordWrapLength: 33,
    }

    if (metaData['spacesCharacter'] !== undefined) {
        options.spacesCharacter = Number(metaData['spacesCharacter']);
    }
    if (metaData['spacesDialog'] !== undefined) {
        options.spacesDialog = Number(metaData['spacesDialog']);
    }
    if (metaData['documentWidth'] !== undefined) {
        options.documentWidth = Number(metaData['documentWidth']);
    }
    if (metaData['dialogWordWrapLength'] !== undefined) {
        options.dialogWordWrapLength = Number(metaData['dialogWordWrapLength']);
    }

    let metaDataText = '';

    metaData = {...metaData, ...options};

    if (Object.keys(metaData).length > 0) {
        metaDataText = JSON.stringify(metaData, null, '  ').replace(/^\s+/g, '').substring(1).replace(/\}$/,'').split('\n').map(l => {
            l = l.replace(/,$/, '').trim();
            return l
        }).join('\n').trim()+`\n`
    }

    let parts = [...sections].map(section => {
        let text = section.html.replace(/<br>/ig, `\n`).replace(/\&nbsp;/g, ' ').trim();
        if (section.classification === 'character') {
            text = `\n` + text.split(`\n`).map(l => {
                return Array(options.spacesCharacter + 1).join(' ') + l.toLocaleUpperCase().trim()
            }).join(`\n`)

        }
        else if (section.classification === 'parenthetical') {
            text = text.split(`\n`).map(l => {
                return Array(options.spacesCharacter - 4).join(' ') + '('+l.trim()+')';
            }).join(`\n`)
        }
        else if (section.classification === 'dialog') {
            text = text.split(`\n`).map(l => {
                return Voca.wordWrap(l.trim(), {
                    width: options.dialogWordWrapLength,
                    indent: Array(options.spacesDialog + 1).join(' ')
                })
            }).join(`\n`)
        }
        else if (section.classification === 'transition') {
            text = `\n` + Voca.padLeft(text.toLocaleUpperCase().trim(), options.documentWidth - text.length, ' ')
        } else {
            // description
            if (!text.trim()) {
                return `\n`;
            }

            text = `\n` + text.split(`\n`).map(l => {
                return Voca.wordWrap(l.trim(), {
                    width: options.documentWidth,
                })
            }).join(`\n`)

        }
        return text;
    })
    return metaDataText + parts.join(`\n`);
}
