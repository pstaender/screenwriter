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
        } else if (el.classList.contains('dialogAnnotation')) {
            classification = 'dialogAnnotation';
        }
        return {
            html: el.innerHTML,
            classification,
        };
    })
}

export function Exporter(sections, metaData = {}) {

    let options = {
        spacesDialogCharacter: 22,
        spacesDialog: 11,
        documentWidth: 61,
        dialogWordWrapLength: 33,
        spacesAnnotation: 31,
    }

    if (metaData['spacesDialogCharacter'] !== undefined) {
        options.spacesDialogCharacter = Number(metaData['spacesDialogCharacter']);
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
        if (section.classification === 'dialogCharacter') {
            text = `\n` + text.split(`\n`).map(l => {
                return Array(options.spacesDialogCharacter + 1).join(' ') + l.toLocaleUpperCase().trim()
            }).join(`\n`)

        }
        else if (section.classification === 'dialogAnnotation') {
            text = text.split(`\n`).map(l => {
                return Array(options.spacesDialogCharacter - 4).join(' ') + '('+l.trim()+')';
            }).join(`\n`)
        }
        else if (section.classification === 'dialogText') {
            text = text.split(`\n`).map(l => {
                return Voca.wordWrap(l.trim(), {
                    width: options.dialogWordWrapLength,
                    indent: Array(options.spacesDialog + 1).join(' ')
                })
            }).join(`\n`)
        }
        else if (section.classification === 'descriptionAnnotation') {
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
