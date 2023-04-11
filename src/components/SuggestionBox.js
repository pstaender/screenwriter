import { useEffect, useRef, useState } from 'react';
import './SuggestionBox.scss';
import fuzzysort from 'fuzzysort'

export function SuggestionBox({ keyPressed, editingLevel, sections, searchText, setShowSuggestions, setHtmlContent, insertNewSectionAfterId, sectionId } = {}) {

    const [searchableRecords, setSearchableRecords] = useState([]);
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const suggestionBoxRef = useRef(null);

    function chooseResultForSection(content) {
        if (content === undefined) {
            return;
        }
        setHtmlContent(content)
        setShowSuggestions(false)
        insertNewSectionAfterId(sectionId);
    }

    function handleSelectResult(ev) {
        chooseResultForSection(ev.target.textContent)
    }


    useEffect(() => {
        let sections = JSON.parse(localStorage.getItem('currentScreenplay')).sections
        let records = [];
        let _searchText = searchText || '';
        if (editingLevel === 'description') {
            // build searches
            records = sections
                .filter(s => s.classification === 'description')
                .filter(s => s.html.trim() && s.html.toLocaleUpperCase() === s.html)
                .map(s => s.html.toLocaleUpperCase())
            records = [...new Set(records)]
        } else if (editingLevel === 'dialogCharacter') {
            // build searches
            records = sections
                .filter(s => s.classification === 'dialogCharacter')
                .map(s => s.html.toLocaleUpperCase())
            records = [...new Set(records)]

        }
        records = records
            .filter(s => !!s)
        setSearchableRecords(records.map(s => s.toLocaleUpperCase().trim()));
    }, [sections, searchText, editingLevel])

    useEffect(() => {
        
        if (searchableRecords.length > 0 && searchText) {
            let result = fuzzysort.go(searchText.toLocaleUpperCase().trim(), searchableRecords, {
                all: true,
                limit: 12, // don't return more results than you need!
                // threshold: -10000, // don't return bad results
            });
            setResults(result);
        }
    },  [searchText])

    useEffect(() => {
        if (!keyPressed) {
            return;
        }
        // console.log(keyPressed.key)
        let resultsCount = results?.length || 0;
        if (keyPressed.key === "ArrowDown") {
            if (selectedResult === null) {
                setSelectedResult(0)
            } else {
                setSelectedResult(selectedResult + 1 >= resultsCount ? 0 : selectedResult + 1);
            }
        } else if (keyPressed.key === "ArrowUp") {
            if (selectedResult === null) {
                setSelectedResult(resultsCount - 1)
            } else {
                setSelectedResult(selectedResult - 1 < 0 ? selectedResult - 1 : selectedResult - 1);
            }
        } else if (keyPressed.key === 'Enter') {
            chooseResultForSection(results[selectedResult]?.target)
        }
        
    }, [keyPressed])

    useEffect(() => {
        if (selectedResult === null || !suggestionBoxRef || !suggestionBoxRef.current) {
            return
        }
        suggestionBoxRef.current.querySelector('ul li.selected')?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
    }, [selectedResult, suggestionBoxRef])

    return (
        <div className='suggestion-box' ref={suggestionBoxRef}>
            <div className={results.length > 0 ? '' : 'empty'}>
                {results.length > 0 && (
                    <ul>
                        {results.map((r, i) => <li className={i === selectedResult ? 'selected' : ''} onClick={handleSelectResult} key={i}>
                            {fuzzysort.highlight(r, (m, i) => <em key={`r${i}`} onClick={handleSelectResult}>
                                {m}
                            </em>)}
                        </li>)}
                    </ul>
                )}
            </div>
        </div>
    )
}
