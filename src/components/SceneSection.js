
import { useEffect, useRef, useState } from "react";

export function SceneSection({ current, goNext, goPrev, removeSection, id, index, sectionsLength} = {}) {

    const inputRef = useRef(null);

    const editingLevels = [
        'description',
        'dialogCharacter',
        'dialogText',
        'descriptionAnnotation',
    ];

    const [editingLevel, setEditingLevel] = useState('description');
    const [isCurrent, setIsCurrent] = useState(current);

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
                inputRef.current.innerHTML = trimLineBreaks(removeAllTagsExceptBr(inputRef.current.innerHTML))
                // console.log(inputRef.innerHTML)
            }
        }

    }, [inputRef, current]);

    useEffect(() => {
        console.debug(editingLevel);
    }, [editingLevel]);

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
        } else if ( (sel = doc.selection) && sel.type != "Control") {
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
            // if (content.trim() === '') {
            setEditingLevel(editingLevels[editingLevels.indexOf(editingLevel) + direction] || editingLevels[0]);
            // }
        }
        if (ev.key === 'Backspace' && inputRef.current.textContent.trim() === '') {
            if (index >= sectionsLength - 1) {
                goPrev({id})
            } else {
                goNext({id})
            }
            removeSection({id})
            
        }
        if (ev.key === 'ArrowDown' && getCaretCharacterOffsetWithin(ev.target) === content.length) {
            goNext({id});
            return;
        }
        else if (ev.key === 'ArrowUp' && getCaretCharacterOffsetWithin(ev.target) === 0) {
            goPrev({id});
            return;
        }
        else if (ev.key === 'Enter') {
            if (!ev.shiftKey) {
                ev.preventDefault();
            }
        }
    }

    function removeAllTagsExceptBr(html) {
        html = html.replace(/(<br>|<br\s*\/>)/ig, '---BRLINEBREAK---');
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent.replace(/---BRLINEBREAK---/g, '<br>')
    }

    function trimLineBreaks(html) {
        return html.replace(/^\s*<br>/ig, '').replace(/<br>\s*$/ig, '')
    }

    function handleFocus() {
        setIsCurrent(true);
    }

    function handleBlur() {
        setIsCurrent(false);
    }

    return <section className={isCurrent ? 'selected' : ''} onClick={handleFocus} data-index={index+1}>
        <div contentEditable={true} onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} className={editingLevel} onKeyDown={handleKeyDown}>
        </div>
    </section>

}
