**course-average-fetcher** is a tool that accesses the crowdsourced course average Google Sheet from McGill Enhanced.

### Setup

First, install dependencies:

```bash
uv sync
```

You also need a Google account and a Google Could project for authentication required to use the Google Sheets API,
follow the instruction [here](https://developers.google.com/sheets/api/quickstart/python).

### Usage

It's a single python script you can run:

```bash
uv run main.py
```

For full usage information, see the output below:

```present uv run main.py --help
usage: main.py [-h] [-o OUTPUT_PATH]

Fetch course averages from the McGill Enhanced Google Sheet.

options:
  -h, --help            show this help message and exit
  -o OUTPUT_PATH, --output-path OUTPUT_PATH
                        The path to the file to write the data to.
```

The obtained course averages will be written into a JSON file located at `client/src/assets` by default.
