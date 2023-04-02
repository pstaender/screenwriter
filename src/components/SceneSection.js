
import { useEffect, useRef, useState } from "react";
import { getCaretCharacterOffsetWithin, moveCursor, stripHTMLTags } from "../lib/helper";

const mementos = []

export function SceneSection({ current, goNext, goPrev, getNext, getPrev, insertNewSectionAfterId, insertNewSectionBeforeId, removeSection, id, index, sectionsLength, html, classification, setCurrentSectionById, cursorToEnd } = {}) {

    const inputRef = useRef(null);

    const editingLevels = [
        'description',
        'dialogCharacter',
        'dialogText',
        'dialogAnnotation',
        'descriptionAnnotation',
    ];

    const [editingLevel, setEditingLevel] = useState(classification || 'description');
    const [isCurrent, setIsCurrent] = useState(current);
    const [htmlContent, setHtmlContent] = useState(html || null)

    useEffect(() => {
        if (current) {
            inputRef.current.focus();
            let s = window.getSelection();
            let r = document.createRange();
            r.setStart(inputRef.current, 0);
            r.setEnd(inputRef.current, 0);
            s.removeAllRanges();
            s.addRange(r);
        }
        if (inputRef?.current) {
            if (inputRef.current.innerHTML) {
                cleanupContenteditableMarkup();
                if (cursorToEnd) {
                    moveCursor(inputRef.current, inputRef.current.textContent.trim().length)
                }
            }
            if (inputRef.current.textContent.trim() === '' && isCurrent) {
                let previousSection = inputRef.current?.closest('section')?.previousElementSibling
                if (previousSection) {
                    let sibling = previousSection;
                    let names = [];
                    while (sibling) {
                        if (sibling.classList.contains('dialogCharacter')) {
                            names.push(sibling.textContent);
                        }
                        if ([...new Set(names.map(l => l.toLocaleLowerCase()))].length > 1) {
                            break;
                        }
                        sibling = sibling.previousElementSibling
                    }

                    if (previousSection.classList.contains('dialogCharacter')) {
                        return setEditingLevel('dialogText');
                    }
                    if (previousSection.classList.contains('dialogAnnotation')) {
                        return setEditingLevel('dialogText');
                    }
                    if (previousSection.classList.contains('dialogText')) {
                        if (names.length > 1) {
                            setHtmlContent(names.at(-1))//.match(/[\w]+/)[0])
                        }
                        return setEditingLevel('dialogCharacter');
                    }
                }
            }
        }

    }, [inputRef, current]);

    // useEffect(() => {
    //     console.debug(editingLevel);
    // }, [editingLevel]);
    function handleKeyDown(ev) {
        const content = ev.target.textContent;
        if (ev.target?.contentEditable !== 'true') {
            return;
        }

        let cursorIsAtEndOfSection = getCaretCharacterOffsetWithin(ev.target) >= content.trim().length;
        let cursorIsAtBeginOfSection = getCaretCharacterOffsetWithin(ev.target) < 1;
        if (ev.key === 'Tab') {
            const direction = ev.shiftKey ? -1 : 1;
            ev.preventDefault();
            let nextLevel = editingLevels[editingLevels.indexOf(editingLevel) + direction];
            setEditingLevel(nextLevel || editingLevels[0]);
            if (ev.shiftKey && !nextLevel) {
                setEditingLevel(editingLevels[editingLevels.length - 1]);
            }
            cleanupContenteditableMarkup()
        }
        if (ev.key === 'Backspace' && (ev.metaKey || ev.ctrlKey || inputRef.current.textContent.trim() === '')) {
            ev.preventDefault();
            if (index >= sectionsLength - 1) {
                goPrev({ id })
            } else {
                goNext({ id })
            }
            // only remove if some elements still exists
            if (document.querySelectorAll('#screenwriter-editor > section').length > 1) {
                if (inputRef.current.innerHTML?.trim()) {
                    mementos.push(inputRef.current.innerHTML)
                }
                goPrev({ id, cursorToEnd: true })
                removeSection(id)
                return
            } else if (inputRef.current) {
                inputRef.current.textContent = '';
            }
        }
        if (ev.ctrlKey && ev.key === 'Z') {
            // undo
            insertNewSectionAfterId(id, { html: mementos.pop() || '' })
            return
        }
        if (((ev.key === 'ArrowDown' || ev.key === 'ArrowRight') && cursorIsAtEndOfSection) ||
        (ev.key === 'ArrowDown' && (ev.metaKey || ev.ctrlKey))) {
            ev.preventDefault();
            if (ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
                // merge next section into this
                let nextSection = ev.target.closest('section').nextElementSibling;
                if (nextSection && nextSection.innerHTML) {
                    inputRef.current.innerHTML += '<br>' + nextSection.textContent.trim().replace(/\n/g, '<br>');
                    let nextID = getNext(id).id;
                    if (nextID) {
                        removeSection(nextID)
                        return;
                    }
                }
            }
            goNext({ id, insert: (ev.metaKey || ev.ctrlKey) });
            return;
        }
        else if (ev.key === 'ArrowUp' && !ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
            goPrev({ id, insert: index <= 1 });
            return;
        }
        else if ((ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') && cursorIsAtBeginOfSection) {
            ev.preventDefault();

            goPrev({ id, insert: (ev.metaKey || ev.ctrlKey) });
            return;
        }
        else if ((ev.key === 'Backspace') && cursorIsAtBeginOfSection) {
            ev.preventDefault();
            // merge previous section into this
            let prevSection = ev.target.closest('section').previousElementSibling;
            if (prevSection && prevSection.innerHTML) {
                inputRef.current.innerHTML = prevSection.textContent.trim().replace(/\n/g, '<br>') + ' ' + inputRef.current.innerHTML.replace(/\n/g, '<br>');
                let nextID = getPrev(id).id;
                moveCursor(inputRef.current, prevSection.textContent.length)
                if (nextID) {
                    removeSection(nextID)
                    return;
                }
            }
            return;
        }
        else if (ev.key === 'Enter' && ev.shiftKey) {
            // do nothing, let create a new line
        }
        else if (
            (ev.key === 'Enter')
        ) {
            ev.preventDefault();
            if (cursorIsAtEndOfSection) {
                insertNewSectionAfterId(id)
            } else if (cursorIsAtBeginOfSection) {
                insertNewSectionBeforeId(id)
            } else {
                let splitUpAt = getCaretCharacterOffsetWithin(inputRef.current);
                if (splitUpAt > 0) {
                    let partRight = inputRef.current.textContent.substring(splitUpAt)
                    let partLeft = inputRef.current.textContent.substring(0, splitUpAt);
                    if (partLeft && partRight) {
                        inputRef.current.textContent = partLeft.trim();
                        insertNewSectionAfterId(id, { html: partRight.trim() })
                    }
                    return
                }

            }
        } else if ((ev.metaKey || ev.ctrlKey) && (ev.shiftKey) && ev.key === 'u') {
            let text = inputRef.current.textContent.toLocaleUpperCase()
            if (text === inputRef.current.textContent) {
                text = inputRef.current.textContent.toLocaleLowerCase()
            }
            inputRef.current.textContent = text;
        }
    }

    function cleanupContenteditableMarkup() {
        function removeAllTagsExceptBr(html) {
            html = html.replace(/(<br>|<br(\s+.+?)*>)/ig, '---BRLINEBREAK---');
            const div = document.createElement("div");
            div.innerHTML = html;
            return div.textContent.replace(/---BRLINEBREAK---/g, '<br>')
        }

        function trimLineBreaks(html) {
            return html.replace(/^\s*<br>/ig, '').replace(/<br>\s*$/ig, '')
        }
        inputRef.current.innerHTML = trimLineBreaks(removeAllTagsExceptBr(inputRef.current.innerHTML))
    }

    function handleFocus(ev) {
        if (isCurrent) {
            return;
        }
        setIsCurrent(true);
        localStorage.setItem('lastIndexOfCurrent', index);
        setCurrentSectionById(id);
        if (ev.type !== 'Click') {
            cleanupContenteditableMarkup();
        }
    }

    function handleBlur() {
        setIsCurrent(false);
        cleanupContenteditableMarkup();
    }

    function additionalTextClass() {
        if (!inputRef.current?.innerText) {
            return;
        }
        let hLevel = inputRef.current.innerText.match(/^(#{1,6})?.*$/)
        if (hLevel && hLevel[1]) {
            return `h${hLevel[1].length}`;
        }
        // not sure we need this… use h6 instead
        if (/^\*\*[^\*]+.*\*\*$/.test(inputRef.current.innerText)) {
            return 'strong';
        }
        if (/^\/\//.test(inputRef.current.innerText)) {
            return 'comment';
        }
        return null;
    }

    // this is require for initial loading, when `inputRef.current` is not set, yet
    function contentFromElementOrProperty() {
        return inputRef.current ? inputRef.current.textContent : html;
    }

    useEffect(() => {
        if (htmlContent) {
            inputRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent])

    return <section className={[
        isCurrent ? 'selected' : '',
        additionalTextClass(),
        editingLevel,
        (contentFromElementOrProperty() && contentFromElementOrProperty().toLocaleUpperCase() === contentFromElementOrProperty() && stripHTMLTags(contentFromElementOrProperty()).trim() && !additionalTextClass()) ? 'sceneIntroduction' : '',
    ].filter(e => !!e).join(' ')} onClick={handleFocus} data-index={index + 1}>
        <div contentEditable={true} onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} className={editingLevel} onKeyDown={handleKeyDown}>
        </div>
    </section>

}
