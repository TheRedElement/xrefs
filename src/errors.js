/**defines custom error classes*/

export class BibRefsError extends Error {
  constructor(message) {
    super(message);          //parent `Error` constructor
    this.name = "BibRefsError";  //custom error name
  }
}

export class GlsError extends Error {
  constructor(message) {
    super(message);          //parent `Error` constructor
    this.name = "GlsError";  //custom error name
  }
}
