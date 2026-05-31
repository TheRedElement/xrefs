
//########
//Imports#
//########

//#######
//Errors#
//#######
class GlsError extends Error {
  constructor(message) {
    super(message);          //parent `Error` constructor
    this.name = "GlsError";  //custom error name
  }
}


//##############
//HTML elements#
//##############
/**
 * class to hosting a glossary
 */
class Glossary extends HTMLElement {
	connectedCallback() {
	}
}
class GlossaryEntry extends HTMLElement {
	connectedCallback() {
	}
}

/**
 * class for displaying glossary entry in text
 */
class GlsText extends HTMLElement {
	connectedCallback() {
	}
}
class GlsHoverText extends HTMLElement {
	connectedCallback() {
	}
}

//#########
//Routines#
//#########
/**
 * class containing all routines to render glossary entries in text and the entire glossary
 * 
 * Attributes
 * ----------
 * 	- `glspath`
 * 		- `string`
 * 		- path to the glossary database
 */
class GlossaryRenderer {
	constructor() {
		this.glspath = `${BASEPATH}data/glossary.json`;
	}

	/**
	 * function to render glossary entries in the text to specification
	 * - will
	 *      - look for all `<tre-gls>` elements in the html document
	 *      - load `this.glspath` (the glossary database)
	 *      - use the `innerHTML` as a key to query `this.glspath`
	 *      - use the elements `className` as the display mode
	 *          - `first`:      display like first occurrence
	 *          - `firstpl`:    display like first occurrence but pluralize
	 *          - `long`:       longform displayed
	 *          - `longpl`:     pluralized longform displayed
	 *          - `short`:      shortform displayed
	 *          - `shortpl`:    pluralized shortform displayed
	 * 		- if `className` starts with a capital letter, the displayed texts first letter will also be capitalized
	 */
	renderText () {
		const glsElements = document.getElementsByTagName("tre-gls");

		fetch(this.glspath)
		.then(response => response.json())
		.then(
			glossary => {

				for (const element of glsElements) {
					const key       = element.innerHTML;    //get glossary key
					let dispMode  = element.className;     	//get display mode from class
					
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
					element.innerHTML += `<tre-gls-hover class="tooltip">${toolTip}</tre-gls-hover>`;
				}
			}
		)
	}

	/**
	 * function to render the entire glossary
	 */
	renderGlossary() {
		const glsElements = document.getElementsByTagName("tre-glossary");

		fetch(this.glspath)
		.then(response => response.json())
		.then(
			glossary => {

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
		)						
	}

	/**
	 * methods to render different glossary displays in the text
	 * @param {Object} glossary 
	 *  - the glossary represented as a js object
	 * @param {string} key 
	 *  - glossary key to access specific entry in `glossary`
	 * @param {Element} element 
	 *  - the html element to denoting where to display the gls entry
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

//###########
//Executions#
//###########
customElements.define("tre-glossary", Glossary);
customElements.define("tre-glossaryentry", GlossaryEntry);
customElements.define("tre-gls", GlsText);
customElements.define("tre-gls-hover", GlsHoverText);

const glsR = new GlossaryRenderer()
glsR.renderText()
glsR.renderGlossary()