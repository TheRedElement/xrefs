
import { BibRefsRenderer } from "./bibrefs.js"
import { GlossaryRenderer } from "./glossary.js"
import { register } from "./tags.js"

/**custom style definitions to make things look pretty*/
const xrefCss = `
    html, body {
        /* init counters */
        counter-reset: bibindex 0;
    }

    /* tooltips */
    .xrefs-tooltip {
        /* hide info */
        position: absolute;
        visibility: hidden;
        opacity: 0;
        /* box positioning */
        z-index: 1000;
        bottom: 125%; /* above the hovered element */
        left: 50%;
        transform: translateX(-50%);
        /* text styling */
        font-size: 1rem;
        font-weight: normal;
        overflow-wrap: break-word;

        /* box styling */
        width: max(100%, 15rem);
        /* height: min(auto, 5em); */
        height: 5em;
        border-radius: 4px;
        background-color: #aaaaaa;
        padding: 0.4em 0.5em;
        overflow-y: scroll;

        /* text styling */
        white-space: pre;

        /* smoothing effects */
        transition:
            opacity 0.3s ease,
            visibility 0.3s ease;
    }

    /* bibliography */
    tre-bibliography a:link,
    tre-bibliography a:visited {
    }
    tre-bibliography tre-bib-item {
        display: flex;
        margin-bottom: 0.5em;
    }
    tre-bibliography tre-bib-item::before {
        counter-increment: bibindex;
        content: "[" counter(bibindex) "]\\00a0";
    }
    tre-bibliography tre-bib-item-body > div {
        display: inline;
    }

    /* glossary */
    tre-glossary:before {
        content: "Glossary";
        display: block;
        font-size: 2em;
        font-weight: bold;
        margin-bottom: 0.5em;
    }
    tre-glossary .head {
        display: block;
        font-weight: bold;
        width: inherit;
    }
    tre-glossary .body {
        display: block;
        margin-left: 1em;
        width: inherit;
        overflow-wrap: break-word;
    }

    /* gls, cite in text */
    tre-gls,
    tre-cite {
        position: relative;
    }
    tre-gls-hover,
    tre-bib-hover {
        /* inherits from .tooltip */
    }
    :where(tre-gls-hover,tre-bib-hover).tooltip {
        /* inherits from .tooltip */
        overflow-x: hidden;
        white-space: normal;
    }
    tre-gls:hover tre-gls-hover,
    tre-cite:hover tre-bib-hover {
        visibility: visible;
        opacity: 0.95;
        /* above element */
        display: block;
        /* always at the bottom */
        position: fixed;
        bottom: 5%;
        left: 50vw;
        transform: translateX(-47vw);
        width: 90%;
    }
`

/**base class for rendering cross references
 *
 */
class XrefsBase {

    constructor({
    } = {}) {
        this.bibPaths = [ "./bib-refs.bib" ];
        this.bibEntryFormat = "long";
        this.citeStyle = "authoryear";
        this.maxAuthors = 5;
        this.glsPaths = [ "./glossary.json" ];
    }

    initialize(configs) {
        this.bibPaths = configs["bibPaths"] || this.bibPaths;
        this.bibEntryFormat = configs["bibEntryFormat"] || this.bibEntryFormat;
        this.citeStyle = configs["citeStyle"] || this.citeStyle;
        this.maxAuthors = configs["maxAuthors"] || this.maxAuthors;
        this.glsPaths = configs["glsPaths"] || this.glsPaths;
    }

    /**adds some custom styles definitions*/
    async addStyle() {
        const styleElement = document.createElement("style");
        styleElement.innerText = xrefCss;
        document.head.prepend(styleElement);    //prepend to make overridable
    }

    /**renderes bibrefs related elements*/
    renderBibRefs() {
        const bibRefsR = new BibRefsRenderer(
            this.bibPaths,
            this.bibEntryFormat,
            this.citeStyle,
            this.maxAuthors,
        );

        bibRefsR.renderText();
        bibRefsR.renderBibliography();
    }

    /**renderes glossary related elements*/
    renderGls() {
        const glsR = new GlossaryRenderer(
            this.glsPaths,
        );
        glsR.loadGlsFiles();
        glsR.renderText();
        glsR.renderGlossary();
    }
    render() {
        //register custom tags
        register();

        //apply styling
        this.addStyle();

        //render cross references
        this.renderBibRefs();
        this.renderGls();
    }
}

export const Xrefs = new XrefsBase()
