import './Cover.scss';
import Showdown from 'showdown';
import parse from 'html-react-parser'

export function Cover({ metaData } = {}) {
    // const [data] = useState(metaData)
    return (
        <>{
            metaData && (metaData.title || metaData.author || metaData.copyright || metaData.description) && (
                <div id="screenplay-cover">
                    <div className="content">
                        {metaData.title && <h1>{parse(metaData.title.replace(/\n/g, '<br>'))}</h1>}
                        {metaData.author && <h2>{parse(metaData.author.replace(/\n/g, '<br>'))}</h2>}
                        {metaData.copyright && <h3>{parse(metaData.copyright.replace(/\n/g, '<br>'))}</h3>}
                        {metaData.description && (
                            <div className="description">{parse(new Showdown.Converter().makeHtml(metaData.description))}</div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
