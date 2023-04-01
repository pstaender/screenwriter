const META_DATA_LINE_REGEX = /^\"[a-zA-Z\_]+?\"\:/

export function Importer(str, options = {}) {
    let parts = str.split(`\n`)

    options = {...{
        minSpacesCharacter: 17,
        maxSpacesCharacter: 22,
        // minSpacesCharacter: 20,
        // maxSpacesCharacter: 30,
        minSpacesAnnotation: null,
        maxSpacesAnnotation: '',
    }, ...options}

    if (!options.minSpacesAnnotation) {
        options.minSpacesAnnotation = options.maxSpacesCharacter + 1;
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
        if (new RegExp(`^\\s{${options.minSpacesCharacter},${options.maxSpacesCharacter}}[A-Z]+`).test(part.split(`\n`)[0])) {
            sections.push({
                text: part.split(`\n`)[0],
                classification: 'dialogCharacter'
            })
            if (part.split(`\n`)[1]) {
                sections = [...sections, ...[{
                    text: part.split(`\n`).splice(1).join(`\n`),
                    classification: 'dialogText'
                }]];
            }
        }
        else if (new RegExp(`^\\s{${options.minSpacesAnnotation},${options.maxSpacesAnnotation}}[A-Z]+`).test(part)) {
            sections.push({
                text: part,
                classification: 'descriptionAnnotation'
            })
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
