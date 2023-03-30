import { expect, jest, test } from '@jest/globals';
import { readFile } from 'fs/promises'

import { Exporter } from './Exporter';
import { Importer } from './Importer';



// beforeAll(async () => {
//     screenplayText = (await readFile(new URL('../../spec/screenplay.txt', import.meta.url))).toString();
// });

test('export to txt format of screenplay', () => {
    let result = Exporter([
        {
            html: 'John',
            classification: 'dialogCharacter',
        },
        {
            html: 'Well, one can\'t have everything.',
            classification: 'dialogText',
        },
        {
            html: ' Cut TO:',
            classification: 'descriptionAnnotation',
        },
        {
            html: `EXT. JOHN AND MARY'S HOUSE - CONTINUOUS<br>    
            An old car pulls up to the curb and a few KNOCKS as the engine shuts down.<br>
            MIKE steps out of the car and walks up to the front door. He rings the doorbell.`,
            classification: 'description'
        },
        {
            html: `JOHN`,
            classification: `dialogCharacter`
        },
        {
            html: `Who on Earth could that be? And why the hell is he ringing the bell at this time of the day?`,
            classification: 'dialogText'
        }
    ]);
    let resultImportAndExportAgain = Exporter(Importer(result).sections)
    expect(result).toEqual(resultImportAndExportAgain)
});
