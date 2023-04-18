import { expect, jest, test } from '@jest/globals';
import { readFile } from 'fs/promises'

import { Exporter, deltaOfData, reverseDeltaPatch } from './Exporter';
import { Importer } from './Importer';

const exampleScreenplaySections = [
    {
        html: 'John',
        classification: 'dialogCharacter',
    },
    {
        html: 'Well, one can\'t have everything.',
        classification: 'dialogText',
    },
    {
        html: ' CUT TO:',
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
        html: `wondering`,
        classification: `dialogAnnotation`
    },
    {
        html: `Who on Earth could that be? And why the hell is he ringing the bell at this time of the day?`,
        classification: 'dialogText'
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

test('export with diff', () => {
    let previousSections = [
        {
            html: 'John',
            classification: 'dialogCharacter',
        },
        {
            html: 'Well, one can\'t have everything…',
            classification: 'dialogText',
        }
    ];
    let previousMetaData = {
        title: 'draft',
    };
    let delta = deltaOfData(exampleScreenplaySections, exampleScreenplayMetaData, previousSections, previousMetaData);
    expect(reverseDeltaPatch(exampleScreenplaySections, exampleScreenplayMetaData, delta)).toEqual({
        sections: previousSections,
        metaData: previousMetaData,
    })
})

xit('export and import without any losses', () => {
    let result = Exporter(exampleScreenplaySections, exampleScreenplayMetaData);
    expect(Importer(result).sections).toEqual(exampleScreenplaySections)
    expect(Importer(result).metaData).toEqual(exampleScreenplayMetaData)
})
