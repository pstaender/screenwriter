import { expect, jest, test } from '@jest/globals';

import { Exporter } from './Exporter';
import { Importer } from './Importer';

const exampleScreenplaySections = [
    {
        html: 'John',
        classification: 'character',
    },
    {
        html: 'Well, one can\'t have everything.',
        classification: 'dialog',
    },
    {
        html: ' CUT TO:',
        classification: 'transition',
    },
    {
        html: `EXT. JOHN AND MARY'S HOUSE - CONTINUOUS<br>    
        An old car pulls up to the curb and a few KNOCKS as the engine shuts down.<br>
        MIKE steps out of the car and walks up to the front door. He rings the doorbell.`,
        classification: 'description'
    },
    {
        html: `JOHN`,
        classification: `character`
    },
    {
        html: `wondering`,
        classification: `parenthetical`
    },
    {
        html: `Who on Earth could that be? And why the hell is he ringing the bell at this time of the day?`,
        classification: 'dialog'
    }
];
const exampleScreenplayMetaData = {
    title: 'Example Screenplay: \n Can be multiline',
    author: 'John Doe'
};

test('export to txt format of screenplay without any exceptions', () => {
    Exporter(exampleScreenplaySections, exampleScreenplayMetaData);
});

test('import exported txt format and export again, without changing the structure', () => {
    let result = Exporter(exampleScreenplaySections, exampleScreenplayMetaData);
    let resultImportAndExportAgain = Exporter(Importer(result).sections, Importer(result).metaData)

    expect(result).toEqual(resultImportAndExportAgain)
});

xit('export and import without any losses', () => {
    let result = Exporter(exampleScreenplaySections, exampleScreenplayMetaData);
    expect(Importer(result).sections).toEqual(exampleScreenplaySections)
    expect(Importer(result).metaData).toEqual(exampleScreenplayMetaData)
})
