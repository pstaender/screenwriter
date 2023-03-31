
import { useEffect, useRef, useState } from "react";

export function SceneSection({ current, goNext, goPrev, getNext, getPrev, removeSection, id, index, sectionsLength, html, classification } = {}) {

    const inputRef = useRef(null);

    const editingLevels = [
        'description',
        'dialogCharacter',
        'dialogText',
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
            }
            if (!inputRef.current.textContent.trim() && isCurrent) {
                let previousSection = inputRef.current?.closest('section')?.previousSibling
                if (previousSection) {
                    let previousPreviousSection = inputRef.current.closest('section').previousSibling?.previousSibling?.previousSibling?.previousSibling
                    if (previousSection.classList.contains('dialogCharacter')) {
                        return setEditingLevel('dialogText');
                    }
                    if (previousSection.classList.contains('dialogText')) {
                        if (previousPreviousSection && previousPreviousSection.textContent && previousPreviousSection.classList.contains('dialogCharacter')) {
                            setHtmlContent(previousPreviousSection.textContent.match(/[\w]+/)[0])
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
        if (ev.key === 'Backspace' && (ev.metaKey || inputRef.current.textContent.trim() === '')) {
            if (index >= sectionsLength - 1) {
                goPrev({ id })
            } else {
                goNext({ id })
            }
            // only remove if some elements still exists
            if (document.querySelectorAll('#screenwriter-editor > section').length > 1) {
                removeSection(id)
            } else if (inputRef.current) {
                inputRef.current.textContent = '';
            }
        }
        if (ev.key === 'ArrowDown' && getCaretCharacterOffsetWithin(ev.target) === content.length) {
            if (ev.shiftKey) {
                ev.preventDefault();
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
            goNext({ id, insert: ev.metaKey });
            return;
        }
        else if (ev.key === 'ArrowUp' && getCaretCharacterOffsetWithin(ev.target) === 0) {
            // if (ev.shiftKey) {
            //     ev.preventDefault();
            //     // merge prev section into this
            //     let prevSection = ev.target.closest('section').previousElementSibling;
            //     if (prevSection && prevSection.innerHTML) {
            //         inputRef.current.innerHTML += '<br>' + prevSection.textContent.trim().replace(/\n/g, '<br>');
            //         let prevID = getPrev(id).id;
            //         if (prevID) {
            //             removeSection(prevID)
            //             return;
            //         }
            //     }
            // }
            goPrev({ id, insert: ev.metaKey });
            return;
        }
        else if (ev.key === 'Enter') {
            if (!ev.shiftKey) {
                ev.preventDefault();
            }
        }
    }

    function cleanupContenteditableMarkup() {
        function removeAllTagsExceptBr(html) {
            html = html.replace(/(<br>|<br\s*\/>)/ig, '---BRLINEBREAK---');
            const div = document.createElement("div");
            div.innerHTML = html;
            return div.textContent.replace(/---BRLINEBREAK---/g, '<br>')
        }

        function trimLineBreaks(html) {
            return html.replace(/^\s*<br>/ig, '').replace(/<br>\s*$/ig, '')
        }
        inputRef.current.innerHTML = trimLineBreaks(removeAllTagsExceptBr(inputRef.current.innerHTML))
    }

    function handleFocus() {
        setIsCurrent(true);
    }

    function handleBlur() {
        setIsCurrent(false);
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
            inputRef.current?.textContent?.trim()?.match(/^(INT|EXT)/) ? 'sceneIntroduction' : '',
        ].filter(e => !!e).join(' ')} onClick={handleFocus} data-index={index + 1}>
        <div contentEditable={true} onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} className={editingLevel} onKeyDown={handleKeyDown}>
        </div>
    </section>

}
