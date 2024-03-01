let redos = [];

const debug = false;

function getMementos() {
    return JSON.parse(localStorage.getItem('mementos') || '[]');
}

function storeMementos(mementos) {
    localStorage.setItem('mementos', JSON.stringify(mementos))
}

function pushMementos(step) {
    let maxDataLength = 12000;
    let mementos = getMementos();

    if (debug) {
        console.debug('pushMemento', step.id, step.html)
    }

    mementos.push(step)
    while (JSON.stringify(mementos).length > maxDataLength) {
        if (debug) {
            console.debug('reached undo limit. shortening history');
        }
        mementos.shift()
    }
    storeMementos(mementos);
}

export function pushRedo(step) {
    if (debug) {
        console.debug('pushRedo', step.id, step.html)
    }
    redos.push({...step, classification: step.editingLevel});
}

export function popRedo() {
    let step = redos.pop();
    if (debug) {
        console.debug('popRedo', step?.id, step?.html)
    }
    if (!step) {
        return null;
    }
   
    return step
}

export function clearUndo() {
    redos = [];
}

export function addMemento(action, { html, id, editingLevel, cursorPosition, getPrev, getNext }) {
    let last = getMementos().filter((m) => m.id === id)[0]
    if (last && (
        last.html.trim() === html.trim()
    )) {
        return;
    }
    pushMementos({
        html,
        id,
        editingLevel,
        classification: editingLevel,
        action,
        cursorPosition,
        prev: getPrev(id)?.id,
        next: getNext(id)?.id,
    });
}

export function popMementos() {
    let mementos = getMementos();
    let latestStep = mementos.pop()
    storeMementos(mementos);
    return latestStep;
}

export function lastMemento() {
    let mementos = getMementos();
    return mementos[mementos.length - 1];
}
