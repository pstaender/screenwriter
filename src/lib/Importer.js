const META_DATA_LINE_REGEX = /^\"[a-zA-Z\_]+?\"\:/

export function Importer(str) {
    let parts = str.split(`\n`)

    let options = {
        spacesDialogCharacter: 21,
        spacesDialog: 11,
        documentWidth: 61,
        dialogWordWrapLength: 33,
        spacesAnnotation: 30,
    }

    function extractMetaData(parts) {
        let eofMetaDataReached = false;
        let metaDataParts = parts.filter((l, i) => {
            if (eofMetaDataReached || !l.match(META_DATA_LINE_REGEX)) {
                if (eofMetaDataReached === false) {
                    eofMetaDataReached = i;
                }
                return false;
            }
            return l.match(META_DATA_LINE_REGEX);
        })

        let metaData = null;

        try {
            metaData = JSON.parse(`{${metaDataParts.join(',')}}`)
        } catch (e) {
            if (!e.message.match(/JSON/)) {
                throw e;
            }
        }

        return { metaData, eofMetaDataReached };
    }

    let { metaData, eofMetaDataReached } = parts[0] && META_DATA_LINE_REGEX.test(parts[0].trim()) ?  extractMetaData(parts) : { metaData: {}, eofMetaDataReached: 0 };

    for (let optionKey in metaData) {
        if (options[optionKey]) {
            options[optionKey] = Number(metaData[optionKey]);
        }
    }

    parts = parts
        .slice(eofMetaDataReached + 1)
        .join(`\n`).replace(/^\n+/, '')
        .replace(/\n+$/, '')
        .replace(/\t/g, '  ')
        .split(`\n\n`)

    let sections = [];
    let i = 0;

    for (let part of parts) {
        part = part.replace(/^\n+/, '')
        if (new RegExp(`^\\s{${options.spacesAnnotation},${options.spacesAnnotation + 20}}?\\w+`).test(part)) {
            sections.push({
                text: part,
                classification: 'descriptionAnnotation'
            })
        } else if (new RegExp(`^\\s{${options.spacesDialogCharacter},${options.spacesDialogCharacter + 2}}?\\w+`).test(part.split(`\n`)[0])) {
            let dialogParts = part.split(`\n`);
            sections.push({
                text: dialogParts.shift(),
                classification: 'dialogCharacter'
            })
            if (dialogParts[0] && dialogParts[0].trim().startsWith('(') && dialogParts[0].trim().endsWith(')')) {
                let annot = dialogParts.shift().trim();
                sections = [...sections, ...[{
                    text: annot.substring(1, annot.length-1),
                    classification: 'dialogAnnotation'
                }]];
            }
            if (dialogParts[0]) {
                sections = [...sections, ...[{
                    text: dialogParts.join(`\n`),
                    classification: 'dialogText'
                }]];
            }
        }
        else {
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
    return { sections, metaData };
}
