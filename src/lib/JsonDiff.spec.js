import { expect, jest, test } from '@jest/globals';

import { deltaOfData, reverseDeltaPatch } from './JsonDiff';

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

test('patch and reverse history', () => {
    let history = [
        {
            sections: [{
                html: 'EXT. HOUSE',
                classification: 'description'
            }]
        },
        {
            sections: [{
                html: 'EXT. HOUSE',
                classification: 'description'
            },
            {
                html: 'A person comes closer to the camera',
                classification: 'description'
            }]
        },
        {
            sections: [{
                html: 'EXT. HOUSE',
                classification: 'description'
            },
            {
                html: 'A person comes closer to the camera.',
                classification: 'description'
            },
            {
                html: 'PERSON',
                classification: 'dialogCharacter'
            }]
        }
    ];
    let deltas = [];
    for(let i in history) {
        deltas.push(deltaOfData(history[i].sections, {}, i > 0 ? history[i-1].sections : [], {}))
    }
    let sections = history.at(-1).sections
    for(let i in history) {
        expect(sections).toEqual(history[history.length - i - 1].sections)
        sections = reverseDeltaPatch(sections, {}, deltas.pop()).sections
    }
})
