The search bar on the frontend of mcgill.courses indexes course data to extract course and instructor keywords to enable fast client-side search.

mcgill.courses stores a json copy of scraped course data as a seed file for database initialization. We actually just reuse this data to index the search data.

However, the files themselves are quite big and when all packaged to the client side, takes a lot of ressources. We do a quick parsing with this tool to only include json fields needed for the search bar to save data.

## Usage

Run this tool from this directory directly:

```shell
python3 parser.py
```

or you can specify arguments

```
--seed-path: Path to the directory containing seed files (default: ../../seed)
--out-path: Path to the output JSON file (default: ../../client/src/assets/searchData.json)
```
