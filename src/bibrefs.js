/**bibrefs.js
 * renders bibliographies and citations in html documents
 *
 * Classes
 * - `BibRefsParser` - parses a set of `.bib` files
 * - `BibRefsRenderer` - renders citations, bibliography
 *
 * Functions
 *
 */

/**imports*/
import { BibRefsError } from "./errors.js";

/**definitions*/
/**
 * class to parse a bib-refs.bib file
 *  - will construct a json-like structure of the following schema
 *  {
 *      "bibkey": {
 *          "author": [
 *              ["author1 surname", "author1 first name 1", "author1 first name 2", ...],
 *              ["author2 surname", "author2 first name 1", "author2 first name 2", ...],
 *              ...,
 *          ],
 *          "title": "title",
 *          "year": year of publication,
 *          <other fields>
 *      }
 *  }
 */
class BibRefsParser {

	constructor() {
		/**
		 * @type {Object.<string, Object>}
		 */
		this.bibEntries = {};
	}

	/**
	 *
	 * @param {string} text
	 *  - string representation of a bib-refs.bib file
	 *  - parsed to extract information
	 */
	parse(text) {
		//reset entries
		this.bibEntries = {};

		text = text.replaceAll(/%[^\n]+/g, "");         //remove comments
		let entries = text.split(/}*\s+@\w+{/g);        //extract entries via separation

		//analyze entries
		for (const entry of entries) {
				this.parseEntry(entry)
		}

		return this.bibEntries
	}

	/**
	 * method to parse an individual `entry`
	 *  - will extract bibkey, field keys, field values
	 *  - will process individual fields
	 *  - updated `this.bibEntries`
	 *
	 * @param {string} entry
	 *  - string representation of the the entry to be parsed
	 * @returns
	 */
	parseEntry(entry) {
		//get relevant components
		var bibKey = entry.match(/.+(?=,)/);
		var keys = [...entry.matchAll(/.+(?==)/g)];
		var values = [...entry.matchAll(/(?<=\=).+/g)];

		//if a bibKey exists
		if (bibKey) {
			this.bibEntries[bibKey] = {};   //init new dict for current entry
			for (let index = 0; index < keys.length; index++) {
				//remove whitespaces
				var fieldKey = keys[index][0].trim();
				var fieldVal = values[index][0].trim();

				//clean the field
				let field = this._cleanField(fieldKey, fieldVal)
				fieldKey = field[0]
				fieldVal = field[1]

				//add new entry
				this.bibEntries[bibKey][fieldKey] = fieldVal;
			}
            //additional fields
            this.bibEntries[bibKey]["referenced"] = false;    //denotes if referenced in text
		}
		return
	}

	/**
	 * function to clean a bib field (keys and values)
	 *  - will
	 *      - remove trailing commas
	 *      - deal with latex macros
	 *      - deal with latex commands
	 *      - parse the "author" field accordingly
	 * @param {string} fieldKey
	 *  - key of the field to be cleaned
	 * @param {string} fieldValue
	 *  - value of the field to be cleaned
	 * @returns {Array}
	 *      - fieldKey
	 *          - {string}
	 *          - cleaned version of fieldKey
	 *      - fieldValue
	 *          - {string, Array}
	 *          - cleaned version of fieldValue
	 */
	_cleanField(fieldKey, fieldValue) {

		fieldValue = fieldValue.replaceAll(/,$/g, "");  //commas at end of field

		//deal with latex-macros
		fieldValue = this._expandLatexMacros(fieldValue);
		fieldValue = this._expandJournalMacros(fieldValue);

		if (fieldKey === "author") {
			//subtleties for author field
			fieldValue = fieldValue.split(" and ");     //authors separated by `" and "`
			fieldValue = fieldValue.map(a => a.split(",").map(s => s.trim()));  //split into name parts
		}
		return [fieldKey, fieldValue]
	}
	/**
	 *
	 * @param {string} text
	 * 	- text to clean by expanding arbitrary latex macros
	 * @returns
	 * 	- `text`
	 * 		- input but with macros expanded
	 */

	_expandLatexMacros(text) {
		text = text.replaceAll("\\'a", "á");
		text = text.replaceAll("\\'A", "Á");
		text = text.replaceAll("\\'c", "ć");
		text = text.replaceAll("\\c{c}", "ç");
		text = text.replaceAll("\\'i", "í");
		text = text.replaceAll("\\'\\i", "í");
		text = text.replaceAll("\\~n", "ñ");
		text = text.replaceAll("\\'o", "ó");
		text = text.replaceAll("\\\"o", "ö");
		text = text.replaceAll("\\v{s}", "š");
		text = text.replaceAll("\\v{Z}", "Ž");
		text = text.replaceAll(/[~]/g, " ");
		text = text.replaceAll("{", "");
		text = text.replaceAll("}", "");
		return text
	}
	/**
	 *
	 * @param {string} text
	 * 	- text to clean by expanding latex macros for journals
	 * @returns
	 * 	- `text`
	 * 		- input but with macros expanded
	 */
	_expandJournalMacros(text) {
		text = text.replaceAll("\\aap", "Astronomy and Astrophysics");
		text = text.replaceAll("\\aaps", "Astronomy and Astrophysics Supplement");
		text = text.replaceAll("\\aapr", "The Astronomy and Astrophysics Review");
		text = text.replaceAll("\\aj", "Astronomical Journal");
		text = text.replaceAll("\\apj", "The Astrophysical Journal");
		text = text.replaceAll("\\apjl", "The Astrophysical Journal");
		text = text.replaceAll("\\apjs", "The Astrophysical Journal Supplement");
		text = text.replaceAll("\\araa", "Annual Review of Astronomy and Astrophysics");
		text = text.replaceAll("\\mnras", "Monthly Notices of the RAS");
		text = text.replaceAll("\\nat", "Nature");
		text = text.replaceAll("\\pasp", "Publications of the Astronomical Society of the Pacific");
		text = text.replaceAll("\\ssr", "Space Science Reviews");
		return text
	}
}

/**
 * class containing all routines to render glossary entries in text and the entire glossary
 *
 */
export class BibRefsRenderer {

    /**creates a renderer
     *
     * @param {Array} bibpaths
     *  - paths to the bibliography files
     *  - have to be `.bib` files
     * @param {string} bibEntryFormat
     *  - format to use for bibliography entries
     *  - options
     *      - `"short"`: compact form
     *      - `"long"`: expanded form
     *  - the default is `"long"`
     * @param {string} citeStyle
     *  - citestyle to use
     *  - queried from `<mega name="citestyle">`
     *  - options
     *      - `"authoryear"`
     *      - `"ieee"`
     *  - the default is `"authoryear"`
     *      - also used if invalid style specified
     * @param {int} maxAuthors
     * 	- maximum number of authors to display
     * 	- overwritten by <tre-bibliography data-maxauthors="..."></tre-bibliography>
     */
	constructor(
        bibPaths,
        bibEntryFormat,
        citeStyle,
        maxAuthors,
    ) {
		this.bibPaths = bibPaths;
        this.bibEntryFormat = bibEntryFormat || "long";
        this.citeStyle = citeStyle || "autoryear";
		this.maxAuthors = maxAuthors || 5;
	}

    /**loads bib-refs into json-object
     *
     * - will
     *      - load all files specified in `this.bibPaths`
     *      - concatenate them
     *      - parse them into a json object
     * @returns {Object} `bibRefs`
     *  - parsed bib-refs
     */
    async loadBibFiles() {

        //combine all bib-refs files
        var bibText = "";
        for (const bp of this.bibPaths) {
            const response =  await fetch(bp);
            bibText += await response.text();
            bibText += "\n"
        }

        //parse into json
		const parser = new BibRefsParser();
		let bibRefs = parser.parse(bibText);

        //extend
        bibRefs = this._extendBibRefs(bibRefs);

        // console.log(bibRefs)
		// console.log(bibRefs["Beck2022_SB9"]["title"])
		// console.log(bibRefs["Beck2022_SB9"]["author"])
		// console.log(bibRefs["Beck2024_GaiaBinaryRG"]["author"])
        return bibRefs
    }


    /**renders citations in the text
	 * function to render bib-ref entries in the text to specification
	 * - will
	 *      - look for all `<tre-cite>` elements in the html document
	 *      - load `this.bibPaths` (the bibliography files)
	 *      - use the `key` `data-attribute` (`data-key`) as a key to query `this.bibPaths`
	 *      - use the elements `className` as the display mode
	 *          - `t`: display like latex `\citet{}`
	 *          - `p`: display like latex `\citep{}`
	 */
	async renderText() {
		const citeElements = document.getElementsByTagName("tre-cite");
        const bibRefs = await this.loadBibFiles();

        for (let idx = 0; idx < citeElements.length; idx++) {
            const element = citeElements[idx];          //current element
			const key       = element.dataset["key"];   //get bib key
			const dispMode  = element.className;        //get display mode from class
            let bibEntryFormat = element.dataset["bibentryformat"] || this.bibEntryFormat

			//NOTE: sort alphabetically
			if (dispMode == "p") {
				this.citep(bibRefs, key, element);
			} else if (dispMode === "t" || dispMode === "") {
				this.citet(bibRefs, key, element);
			}

			//add tooltip
			let bibFields = this._getBibFields(bibRefs[key], 5);
			let bibEntryContent = this._makeBibEntry(bibFields, bibEntryFormat);
			let toolTip = document.createElement("tre-bib-hover");
			toolTip.className = "xrefs-tooltip";
			element.appendChild(toolTip);
			toolTip.appendChild(bibEntryContent);
		}
	}

    /**renders bibliography
     *
     */
	async renderBibliography() {
		const bibElements = document.getElementsByTagName("tre-bibliography");
		const citeElements = document.getElementsByTagName("tre-cite");
        let bibRefs = await this.loadBibFiles();


        for (const element of bibElements) {
			let subBibliography = element.dataset["subbibliography"];									//indicates sub-bibliography to use
			let maxAuthors = parseInt(element.dataset.maxauthors) || this.maxAuthors;	//get number of authors to display
            let bibType = element.dataset["bibtype"];
            let bibEntryFormat = element.dataset["bibentryformat"] || this.bibEntryFormat

            let bibEntryNumber = 1;
			for (const entry in bibRefs) {
				let bibFields = this._getBibFields(bibRefs[entry], maxAuthors);

                //filtering to only display what is desired
                let subBibFilter = (
                    bibFields["keywords"].includes(subBibliography)
                    || subBibliography===undefined
                    || subBibliography===""
                );
                let referencedFilter = (bibType === "referenced") ? (bibRefs[entry]["referenced"]) : true;

				//check if entry shall be displayed (based on filters)
				if (subBibFilter && referencedFilter) {

					//recolor authors
					bibFields["authors"] = bibFields["authors"].replaceAll("Steinwender", "<span style='color: var(--c_main)'>Steinwender");
					bibFields["authors"] = bibFields["authors"].replaceAll("L.", "L.</span>");
					bibFields["authors"] = bibFields["authors"].replaceAll("Lukas", "Lukas</span>");

					//create bibliography entry
					const bibItem = this._makeBibEntry(bibFields, bibEntryFormat, bibEntryNumber);
					element.appendChild(bibItem);

                    //next entry
                    bibEntryNumber += 1;
				}
			}
			// element.innerHTML = bibContent
		}
	}


	/**
	 * methods to render different citation displays in the text
	 * @param {Object} bibRefs
	 *  - the bibRefs files represented as a js object
	 * @param {string} key
	 *  - glossary key to access specific entry in `glossary`
	 * @param {Element} element
	 *  - the html element to denoting where to display the gls entry
	 */
	citet(bibRefs, key, element) {
		let bibString = "??";

		if ((bibRefs[key]["author"] === undefined) || (bibRefs[key]["year"] === undefined)) {
			//do nothing (leave placeholder)
        } else if (this.citeStyle === "ieee") {
            bibString = `[${bibRefs[key]["rank"]}]`;
		} else {
            //default = authoryear
			bibString = bibRefs[key]["author"][0][0] + " et al. (" + bibRefs[key]["year"] + ")";	//surname of first author
		}
		element.innerHTML = bibString;
	}
	citep(bibRefs, key, element) {
		let bibString = "??";
		if ((bibRefs[key]["author"] === undefined) || (bibRefs[key]["year"] === undefined)) {
			//do nothing (leave placeholder)
        } else if (this.citeStyle === "ieee") {
            bibString = `[${bibRefs[key]["rank"]}]`;
		} else {
            //default = authoryear
			bibString = bibRefs[key]["author"][0][0] + " et al., " + bibRefs[key]["year"];	//surname of first author
		}
		element.innerHTML = bibString;
	}


	//subroutines
    /**adds addtional fields to `bibRefs`
     *
     * - for all mentioned references
     *   - adds a rank for ieee citestyle
     * - for all references
     *   -
     *
     * Parameters
     * @param {Object} bibRefs
     *  - parsed and combined .bib files
     *
     * Returns
     * @returns {Object} bibRefs
     *  - `bibRefs` with additional fields
     */
    _extendBibRefs(bibRefs) {
		const citeElements = document.getElementsByTagName("tre-cite");

        //all references
        for (const key of Object.keys((bibRefs))) {
            bibRefs[key]["rank"] = undefined;   //init `"rank"`
            bibRefs[key]["referenced"] = false; //init `"referenced"`
        };

        //mentioned references
        let maxRank = 1;    //number of unique references for ieee
        for (let idx = 0; idx < citeElements.length; idx++) {
            const element = citeElements[idx];          //current element
			const key       = element.dataset["key"];   //get bib key
			const dispMode  = element.className;        //get display mode from class

            //add citation order for ieee
            if ((bibRefs[key]["rank"] === undefined)) {
                bibRefs[key]["rank"] =  maxRank;
                maxRank += 1;   //next new object gets a new rank
            };

            //update flag denoting if entry was referenced
            bibRefs[key]["referenced"] = true
        };


        //sorting based on different `citeStyle`s
        if (this.citeStyle === "ieee") {
            //sort based on appearance in text (referenced citations are displayed first)
            bibRefs = Object.fromEntries(
                Object.entries(bibRefs).sort(([, a], [, b]) => {
                    const refA = a["referenced"];
                    const refB = b["referenced"];
                    const rankA = (refA) ? a["rank"] : Infinity;
                    const rankB = (refB) ? b["rank"] : Infinity;
                    return rankA - rankB
                })
            );
        } else {
            //sort alphabetically by default
            //authors first, then year
            bibRefs = Object.fromEntries(
                Object.entries(bibRefs).sort(([, a], [, b]) => {
                    const bibFieldsA = this._getBibFields(a, this.maxAuthors);
                    const bibFieldsB = this._getBibFields(b, this.maxAuthors);
                    const sortStrA = bibFieldsA["authors"] + bibFieldsA["year"];
                    const sortStrB = bibFieldsB["authors"] + bibFieldsB["year"];
                    return sortStrA.localeCompare(sortStrB);
                })
            );
        };

        //reassign rank to ensure all bib-refs have an integer rank
        let curRank = 1;
        for (const key of Object.keys(bibRefs)) {
            bibRefs[key]["rank"] = curRank;
            curRank += 1;
        };
        return bibRefs
    }

	/**
	 * method to extract all relevant bib-fields into a 1-layer dictionary
	 * @param {Object} bibEntry
	 * 	- dictionary of a single bibliography enty
	 * @param {Int} maxAuthors
	 * 	- maximum number of authors to display when rendering the bibliography entry
	 *
	 * @returns
	 * 	- `bibFields`
	 * 		- `object`
	 * 		- shallow dictionary containing relevant bib fields
	 */
	_getBibFields(bibEntry, maxAuthors) {
		//special cases
		let authors = bibEntry["author"].slice(0,maxAuthors).map(a => a.join(" ")).join(", ")
		let keywords = [];
		if (bibEntry["author"].length > maxAuthors || maxAuthors===undefined) {
			authors += ", et al.";
		}
		if (bibEntry["keywords"]) {
			keywords = bibEntry["keywords"].split(", ");
		}

		//combine in clean output form
		let bibFields = {
			authors: authors,
			arXiv: (
				bibEntry["eprint"] ||
				undefined
			),
			keywords: keywords,
			doi: (
				bibEntry["doi"] ||
				undefined
			),
			eid: (
				bibEntry["eid"] ||
				undefined
			)		,
			journal: (
				bibEntry["journal"] ||
				bibEntry["publisher"] ||
				bibEntry["series"] ||
				bibEntry["booktitle"] ||
				undefined
			),
			month: (
				bibEntry["month"] ||
				undefined
			)	,
			pages: (
				bibEntry["pages"] ||
				bibEntry["eid"] ||
				undefined
			)	,
			title: (
				bibEntry["title"] ||
				undefined
			),
			volume: (
				bibEntry["volume"] ||
				undefined
			),
			url: (
				bibEntry["adsurl"] ||
				bibEntry["url"] ||
				bibEntry["howpublished"] ||
				undefined
			),
			year: (
				bibEntry["year"] ||
				undefined
			),
            rank: (
                bibEntry["rank"] ||
                undefined
            )
		}
		return bibFields
	}
	/**creates a single bibliography entry
	 *
     * @param {object} bibFields
	 * 	- shallow dictionary containing relevant bib fields
     * @param {string} bibEntryFormat
     *  - type of the bibliography entry
     *  - options are
     *      - `"short"`: compact display
     *      - `"long"`: expanded display
     * @param {Int} bibEntryNumber
     *  - number of the bibliography entry
     *      - sequentially increasing w.r.t. all elements in the bibliography
	 * @returns {HTMLElement} bibItem
	 * 	- element containing the bibliography item
	 */
	_makeBibEntry(bibFields, bibEntryFormat, bibEntryNumber) {
		//init bibliography item
		const bibItem = document.createElement("tre-bib-item");

        //add index
        const bibItemIndex = document.createElement("tre-bib-item-index");
        if (this.citeStyle === "ieee") {
            //reference order == index
            bibItemIndex.innerText = `[${bibFields["rank"]}]`;
        } else {
            //alphabetical sorting (index is ascending sequence)
            bibItemIndex.innerText = `[${bibEntryNumber}]`;
        }
        bibItem.appendChild(bibItemIndex);

		//add head
		const bibItemHead = document.createElement("tre-bib-item-head");
		bibItem.appendChild(bibItemHead);

		//add body
		const bibItemBody = document.createElement("tre-bib-item-body");
		bibItem.appendChild(bibItemBody)

		//fill body
		const bibItemAuthors = document.createElement("div");
		bibItemAuthors.className = "bib-authors";
		bibItemAuthors.innerHTML = (bibFields["authors"] === undefined) ? "" : `${bibFields["authors"]}. `;
		bibItemBody.appendChild(bibItemAuthors);
        let text = "";          //init body text

        if (bibEntryFormat === "long") {
            const bibItemTitle = document.createElement("div");
            bibItemTitle.className = "bib-title";
            text = "";	//reset text
            if ((bibFields["url"] !== undefined) & (bibFields["title"] !== undefined)) {
                text = `"<a href='${bibFields["url"]}'>${bibFields["title"]}</a>". `;
            } else if (bibFields["title"] !== undefined) {
                text = `"<a href='#'>${bibFields["title"]}</a>". `;
            }
            bibItemTitle.innerHTML = text;
            bibItemBody.appendChild(bibItemTitle);
        }

		const bibItemJournal = document.createElement("div");
		bibItemJournal.className = "bib-journal";
		text = "";	//reset text
		if (bibFields["journal"] === undefined) {
			text = "";
		} else  {
            text = (bibEntryFormat === "long") ? "In: " : "";
			text += `${bibFields["journal"]}`;
			text += (bibFields["volume"] === undefined) ? "" : ` ${bibFields["volume"]}`;
			text += (bibFields["pages"] === undefined) ? "" : `, ${bibFields["pages"]}`;
			text += ". "
		}
		bibItemJournal.innerHTML = text;
		bibItemBody.appendChild(bibItemJournal);

		const bibItemDate = document.createElement("div");
		bibItemDate.className = "bib-date";
		text = ""; 	//reset text
		if (bibFields["year"] === undefined) {
			text = "";
		} else {
			let textMonth = (bibFields["month"] === undefined) ? "" : `${bibFields["month"]}. `;
			text = `(${textMonth}${bibFields["year"]})`;
		}
        if (bibEntryFormat === "long") {
            if (bibFields["eid"] === undefined) {

                text += ". "
            } else {
                text += `, ${bibFields["eid"]}. `;
            }
        }

		bibItemDate.innerHTML = text;
		bibItemBody.appendChild(bibItemDate);

		const bibItemDoi = document.createElement("div");
		bibItemDoi.className = "bib-doi";
		bibItemDoi.innerHTML = (bibFields["doi"] === undefined) ? "" : `DOI: <a href='https://doi.org/${bibFields["doi"]}'>${bibFields["doi"]}</a>. `;
		bibItemBody.appendChild(bibItemDoi);

		const bibItemArxiv = document.createElement("div");
		bibItemArxiv.className = "bib-arxiv";
		bibItemDoi.innerHTML = (bibFields["arxiv"] === undefined) ? "" : `arXiv: <a href="https://arxiv.org/abs/${bibFields["arXiv"]}">${bibFields["arXiv"]}</a>.`;
		bibItemBody.appendChild(bibItemArxiv);

		return bibItem
	}
}


