# xref

* pretty and consistent cross-references in HTML documents
* customizations possible upon script loading

## Quickstart

1. clone this git-repo into your project
2. copy the code-snippet below to the bottom of your html `<body></body>`
3. replace `<path/to/repo/>` with the path pointing to the cloned repo
4. customize the appearance using the fields in `Xrefs.initialize()`

```html
    <!-- `importmap` to load local scripts -->
    <script type="importmap">
    {
        "imports": {
            "xrefs": "<path/to/repo>/src/index.js"
        }
    }
    </script>

    <!-- Xrefs setup -->
    <script type="module">
        import { Xrefs } from "xrefs";
        Xrefs.initialize({
            "bibPaths": [
                "./bib-refs.bib",
            ],
            "bibEntryFormat": [
            "long",
            "short",
            ][0],
            "citeStyle": [
                "authoryear",
                "ieee",
            ][0],
            "maxAuthors": 5,
            "glsPaths": [
                "../glossary.json",
            ],
        });

        Xrefs.render();
        console.log(Xrefs)
    </script>
```


> [NOTE]
> you can check [test.html](./tests/test.html) for an example html file
