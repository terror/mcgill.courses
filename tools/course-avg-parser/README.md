This is a script that accesses the crowdsourced course average Google Sheet from McGill Enhanced.

## Prerequisite

Package management is done using Poetry, install dependencies using

```shell
poetry install
```

You also need a Google account and a Google Could project for authentication required to use the Google Sheets API, follow the instruction [here](https://developers.google.com/sheets/api/quickstart/python).

## Running the script

Enter the shell with

```shell
petry shell
```

and run the script with

```shell
python3 main.py
```

The obtained course averages will be written into a JSON file located at `client/src/assets`.

