import * as jsondiffpatch from 'jsondiffpatch';

export function deltaOfData(sections, metaData, previousSections = [], previousMetaData = {}) {
    let current = {
        sections,
        metaData,
    };
    let previous = {
        sections: previousSections,
        metaData: previousMetaData,
    }
    return jsondiffpatch.diff(current, previous);
}

export function reverseDeltaPatch(sections, metaData, delta) {
    return jsondiffpatch.patch({sections, metaData}, delta);
}
