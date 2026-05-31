/**glossary.js
 * renders glossary and glossary-references  in html documents
 *
 * Classes
 * - `GlossaryRenderer` - renders in-text glossary references, glossary
 *
 * Functions
 *
 */


/**imports*
import { GlsError } from "./errors";


/**definitions*/
/**
 * class containing all routines to render glossary entries in text and the entire glossary
 *
 */
export class GlossaryRenderer {

    /**creates a renderer
     *
     * @param {string} glsPaths
     *  - path to the glossary database
     *  - has to be a `.json` file
     */
	constructor(
        glsPaths,
    ) {
		this.glsPaths = glsPaths;
	}

    /**loads glossary files into json-object
     *
     * - will
     *      - load all files specified in `this.glsPaths`
     *      - parse them into a json object
     *      - join all the json objects
     * @returns {Object} `glossary`
     *  - parsed glossary
     */
    async loadGlsFiles() {

        //combine all glossary files
        var glossary = {}; //init glossary
        for (const path of this.glsPaths) {
            const response =  await fetch(path);
            const data = await response.json();
            glossary = { ...data };
        };
        return glossary
    }

	/**renders glossary entries in the text to specification
	 * - will
	 *      - look for all `<tre-gls>` elements in the html document
	 *      - load `this.glsPaths` (the glossary database)
	 *      - use the `key` `data-attribute` (`data-key`) as a key to query `this.glsPaths`
	 *      - use the elements `className` as the display mode
	 *          - `first`:      display like first occurrence
	 *          - `firstpl`:    display like first occurrence but pluralize
	 *          - `long`:       longform displayed
	 *          - `longpl`:     pluralized longform displayed
	 *          - `short`:      shortform displayed
	 *          - `shortpl`:    pluralized shortform displayed
	 * 		- if `className` starts with a capital letter, the displayed texts first letter will also be capitalized
	 */
	async renderText() {
		const glsElements = document.getElementsByTagName("tre-gls");
        const glossary = await this.loadGlsFiles();

        for (let idx = 0; idx < glsElements.length; idx++) {
            const element = glsElements[idx];           //current element
            const key       = element.dataset["key"];   //get glossary key
            let dispMode  = element.className;     	    //get display mode from class

            //flags
            let cap		= /^[A-Z]/g.test(dispMode)	//check if first letter is capital

            //convert to lowercase (to use same function for `cap` an no `cap`)
            dispMode = dispMode.toLowerCase()

            //fallback
            let glsString = "<span class='todoLS'>glossary entry not found<span>"
            //NOTE: sort alphabetically
            if (dispMode === "first") {
                glsString = this.first(glossary, key)
            } else if (dispMode === "firstpl") {
                glsString = this.firstpl(glossary, key)
            } else if (dispMode === "long") {
                glsString = this.long(glossary, key)
            } else if (dispMode === "longpl") {
                glsString = this.longpl(glossary, key)
            } else if (dispMode === "short" | dispMode === "") {
                glsString = this.short(glossary, key)
            } else if (dispMode === "shortpl") {
                glsString = this.shortpl(glossary, key)
            } else {
                //error if unsupported
                throw new GlsError(`
                        unsupported 'class' (${dispMode}).
                        Currently supported are: 'first', 'firstpl', 'long', 'longpl', 'short', 'shortpl' and capitalized versions.
                        You can also omit the 'class', in which case 'short' will be used.
                    `)
            }

            //apply to element
            if (!cap) {
                //no capitalization
                element.innerHTML = glsString;
            } else {
                //first letter uppercase
                element.innerHTML = glsString.charAt(0).toUpperCase() + glsString.slice(1);
            }

            //add tooltip
            let toolTip = "";
            if (glossary[key]["long"]) {
                toolTip += `${glossary[key]["long"]}<br>`;
            }
            if (glossary[key]["description"]) {
                toolTip += `${glossary[key]["description"].join("")}`;
            }
            element.innerHTML += `<tre-gls-hover class="xrefs-tooltip">${toolTip}</tre-gls-hover>`;
        }
    }

	/**renders glossary
	 *
	 */
	async renderGlossary() {
		const glsElements = document.getElementsByTagName("tre-glossary");
        const glossary = await this.loadGlsFiles();

        for (const element of glsElements) {
            let glsContent	= ""

            for (const entry in glossary) {
                if (!entry.startsWith("\$schema")) {
                    let glsEntryContent = `
                                <div class="head">
                                    ${glossary[entry]["short"].charAt(0).toUpperCase()}${glossary[entry]["short"].slice(1)} (${glossary[entry]["long"]})
                                </div>
                                <div class="body">
                                    ${glossary[entry]["description"].join("")}
                                </div>
                                `
                    glsEntryContent = glsEntryContent;
                    glsContent += glsEntryContent + "<br>"
                }

            }
            element.innerHTML = glsContent
        }
	}

	/**
	 * methods to render different glossary displays in the text
	 * @param {Object} glossary
	 *  - the glossary represented as a js object
	 * @param {string} key
	 *  - glossary key to access specific entry in `glossary`
	 */
	first(glossary, key) {
		//display first occurrence
		let glsString = ""
		if (glossary[key]["first"] === undefined) {
			glsString = glossary[key]["short"] + " (" + glossary[key]["long"] + ")";
		} else {
			glsString = glossary[key]["first"];
		}
		return glsString
	}
	firstpl(glossary, key) {
		//display plural first occurrence
		let glsString = ""
		if (glossary[key]["firstpl"] === undefined) {
			glsString = glossary[key]["short"]+ "s" + " (" + glossary[key]["long"] + "s" + ")";
		} else {
			glsString = glossary[key]["firstpl"];
		}
		return glsString
	}
	long(glossary, key) {
		//display longform
		let glsString = ""
		glsString = glossary[key]["long"];
		return glsString
	}
	longpl(glossary, key) {
		//display plural of longform
		let glsString = ""
		if (glossary[key]["longpl"] === undefined) {
			glsString = glossary[key]["long"] + "s";
		} else {
			glsString = glossary[key]["longpl"];
		}
		return glsString
	}
	short(glossary, key) {
		//display shortform
		let glsString = ""
		glsString = glossary[key]["short"];
		return glsString
	}
	shortpl(glossary, key) {
		//display plural of shortform
		let glsString = ""
		if (glossary[key]["shortpl"] === undefined) {
			glsString = glossary[key]["short"] + "s";
		} else {
			glsString = glossary[key]["shortpl"];
		}
		return glsString
	}
}

