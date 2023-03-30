export function Importer(str) {
    let parts = str.split(`\n`)


    function extractMetaData(parts) {
        let eofMetaDataReached = false;
        let metaDataParts = parts.filter((l, i) => {
            if (eofMetaDataReached || !l.match(/^[^\:]+?\:\s+.+$/)) {
                if (eofMetaDataReached === false) {
                    eofMetaDataReached = i;
                }
                return false;
            }
            return l.match(/^[^\:]+?\:\s+.+$/);
        })

        let metaData = {};
        metaDataParts.forEach(m => {
            metaData[m.split(':')[0].trim()] = m.split(':')[1].trim()
        })
        return { metaData, eofMetaDataReached };
    }

    let { metaData, eofMetaDataReached } = extractMetaData(parts);


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

        if (/^\s{17,22}[A-Z]+/.test(part.split(`\n`)[0])) {
            sections.push({
                text: part.split(`\n`)[0],
                classification: 'dialogCharacter'
            })
            if (part.split(`\n`)[1]) {
                // console.log(part.split(`\n`).splice(1).join(`\n`))
                sections = [...sections, ...[{
                    text: part.split(`\n`).splice(1).join(`\n`),
                    classification: 'dialogText'
                }]];
            }
        }
        else if (/^\s{26,}[A-Z]+/.test(part)) {
            sections.push({
                text: part,
                classification: 'descriptionAnnotation'
            })
        }

        // else if (/^\s{6,16}[A-Z]+/.test(part)) {
        //     sections.push({
        //         text: part,
        //         classification: 'dialogText'
        //     })
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
