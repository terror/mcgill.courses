The search functionality in mcgill.courses implements client-side indexing of course data,
extracting course and instructor keywords for optimized search performance.

Our system utilizes a JSON seed file containing scraped course data for database initialization,
which we repurpose for the search indexing process.

To address performance concerns, the raw data files are substantial and would consume
excessive resources when bundled for client-side delivery.

**search-index-aggregator** selectively includes only the JSON fields required by the
search component, significantly reducing payload size and improving resource efficiency.

### Usage

Run this tool from this directory directly:

```shell
python3 parser.py
```

or you can specify arguments

```
--seed-path: Path to the directory containing seed files (default: ../../seed)
--out-path: Path to the output JSON file (default: ../../client/src/assets/searchData.json)
```
