
/**hosts the tooltip for a citation*/
class BibHoverText extends HTMLElement {
	connectedCallback() {
	}
}
/**hosts a bibliography item (entry)*/
class BibItem extends HTMLElement {
	connectedCallback() {
	}
}
/**hosts the body of a bibliography item*/
class BibItemBody extends HTMLElement {
	connectedCallback() {
	}
}
/**hosts the  header of a bibliography item*/
class BibItemHead extends HTMLElement {
	connectedCallback() {
	}
}
/**hosts the index of a bibliography item*/
class BibItemIndex extends HTMLElement {
	connectedCallback() {
	}
}
/**class hosting a bibliography*/
class Bibliography extends HTMLElement {
	connectedCallback() {
	}
}
/**displays a citation in the text*/
class Cite extends HTMLElement {
	connectedCallback() {
	}
}


/**hosts a glossary*/
class Glossary extends HTMLElement {
	connectedCallback() {
	}
}
/**hosts a glossary entry*/
class GlossaryEntry extends HTMLElement {
	connectedCallback() {
	}
}
/**displays glossary entry in text*/
class GlsText extends HTMLElement {
	connectedCallback() {
	}
}
/**hosts the tooltip for a glossary reference in the text*/
class GlsHoverText extends HTMLElement {
	connectedCallback() {
	}
}


/**registers all custom tags*/
export function register() {
    customElements.define("tre-bib-hover", BibHoverText);
    customElements.define("tre-bibliography", Bibliography);
    customElements.define("tre-bib-item", BibItem);
    customElements.define("tre-bib-item-body", BibItemBody);
    customElements.define("tre-bib-item-head", BibItemHead);
    customElements.define("tre-bib-item-index", BibItemIndex);
    customElements.define("tre-cite", Cite);

    customElements.define("tre-glossary", Glossary);
    customElements.define("tre-glossaryentry", GlossaryEntry);
    customElements.define("tre-gls", GlsText);
    customElements.define("tre-gls-hover", GlsHoverText);

}

