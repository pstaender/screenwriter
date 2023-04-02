
import { useEffect, useRef, useState } from "react";

const mementos = []

export function SceneSection({ current, goNext, goPrev, getNext, getPrev, insertNewSectionAfterId, removeSection, id, index, sectionsLength, html, classification, setCurrentSectionById } = {}) {

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
            // if (!cursorToEnd) {
            // to the beginning
            inputRef.current.focus();
            let s = window.getSelection();
            let r = document.createRange();
            r.setStart(inputRef.current, 0);
            r.setEnd(inputRef.current, 0);
            s.removeAllRanges();
            s.addRange(r);
            // }
        }
        if (inputRef?.current) {
            if (inputRef.current.innerHTML) {
                cleanupContenteditableMarkup();
            }
            if (!inputRef.current.textContent.trim() && isCurrent) {
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

    function getCaretCharacterOffsetWithin(element) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection !== "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }



    function handleKeyDown(ev) {
        const content = ev.target.textContent;
        if (ev.target?.contentEditable !== 'true') {
            return;
        }

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
        if (ev.key === 'Backspace' && ((ev.metaKey || ev.ctrlKey) || inputRef.current.textContent.trim() === '')) {
            if (index >= sectionsLength - 1) {
                goPrev({ id })
            } else {
                goNext({ id })
            }
            // only remove if some elements still exists
            if (document.querySelectorAll('#screenwriter-editor > section').length > 1) {
                //localStorage.setItem('lastDeletedSectionHTML', inputRef.current.innerHTML)
                if (inputRef.current.innerHTML?.trim()) {
                    mementos.push(inputRef.current.innerHTML)
                }
                removeSection(id)
            } else if (inputRef.current) {
                inputRef.current.textContent = '';
            }
        }
        if ((ev.metaKey || ev.ctrlKey) && ev.key === 'z' && inputRef.current?.innerHTML) {
            // undo
            insertNewSectionAfterId(id, { html: mementos.pop() || '' })
            return
        }
        if ((ev.key === 'ArrowDown' || ev.key === 'ArrowRight') && getCaretCharacterOffsetWithin(ev.target) === content.length) {
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
        else if ((ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') && getCaretCharacterOffsetWithin(ev.target) === 0) {
            ev.preventDefault();
            if (ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
                // merge previous section into this
                let prevSection = ev.target.closest('section').previousElementSibling;
                if (prevSection && prevSection.innerHTML) {
                    inputRef.current.innerHTML = prevSection.textContent.trim().replace(/\n/g, '<br>') + '<br>' + inputRef.current.innerHTML;
                    let nextID = getPrev(id).id;
                    if (nextID) {
                        removeSection(nextID)
                        return;
                    }
                }
            }
            goPrev({ id, insert: (ev.metaKey || ev.ctrlKey) });
            return;
        }
        else if ((ev.metaKey || ev.ctrlKey) && (ev.shiftKey) && ev.key === 'Enter') {
            let splitUpAt = getCaretCharacterOffsetWithin(inputRef.current);
            if (splitUpAt > 0) {
                let partRight = inputRef.current.textContent.substring(splitUpAt)
                let partLeft = inputRef.current.textContent.substring(0, splitUpAt);
                if (partLeft && partRight) {
                    inputRef.current.textContent = partLeft.trim();
                    insertNewSectionAfterId(id, { html: partRight.trim() })
                }

            }
        }
        else if (ev.key === 'Enter') {
            if (!ev.shiftKey) {
                ev.preventDefault();
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
        setCurrentSectionById(id);
        if (ev.type !== 'Click') {
            cleanupContenteditableMarkup();
        }
    }

    function handleBlur() {
        setIsCurrent(false);
        cleanupContenteditableMarkup();
    }

    useEffect(() => {
        if (htmlContent) {
            inputRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent])

    return <section className={
        [
            isCurrent ? 'selected' : '',
            editingLevel,
            (inputRef.current?.textContent && inputRef.current?.textContent.toLocaleUpperCase() === inputRef.current.textContent) ? 'sceneIntroduction' : '',
        ].filter(e => !!e).join(' ')} onClick={handleFocus} data-index={index + 1}>
        <div contentEditable={true} onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} className={editingLevel} onKeyDown={handleKeyDown}>
        </div>
    </section>

}
