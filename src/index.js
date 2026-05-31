
import { BibRefsRenderer } from "./bibrefs.js"

class XrefsBase {

    constructor({
    } = {}) {
        this.bibPaths = [ "./bib-refs.bib" ]
        this.bibEntryFormat = "long"
        this.citeStyle = "authoryear"
        this.maxAuthors = 5
    }

    initialize(configs) {
        this.bibPaths = configs["bibPaths"] || this.bibPaths;
        this.bibEntryFormat = configs["bibEntryFormat"] || this.bibEntryFormat;
        this.citeStyle = configs["citeStyle"] || this.citeStyle;
        this.maxAuthors = configs["maxAuthors"] || this.maxAuthors;
    }

    renderBibRefs() {
        const bibRefsR = new BibRefsRenderer(
            this.bibPaths,
            this.bibEntryFormat,
            this.citeStyle,
            this.maxAuthors
        );

        bibRefsR.renderText();
        bibRefsR.renderBibliography();
    }

    render() {
        this.renderBibRefs();
        // this.renderGls();
    }
}

export const Xrefs = new XrefsBase()
