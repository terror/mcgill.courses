## mcgill.courses

<div>
  <img width='100px' src='https://user-images.githubusercontent.com/31192478/235252457-6364a167-29d7-4b24-96f5-db73c38209e8.png'>
</div>

A course search and review platform for McGill university.

### Development

You'll need [docker](https://www.docker.com/),
[cargo](https://doc.rust-lang.org/cargo/) and [npm](https://www.npmjs.com/)
installed on your machine to spawn the various components the project needs to
run locally.

First, mount a local mongodb instance with docker:

```bash
$ docker compose up -d
```

Spawn the server with a data source (in this case the `/seed` directory) and
initialize the database:

```bash
$ cargo run -- --source=seed serve --initialize --db-name=mcgill-courses
```

Refer to `.env.example` and `client/.env.example` for what environment variables
need to be set.

_n.b._ The server command-line interface provides a load subcommand for scraping
all courses from various McGill course information websites and building a JSON
data source, for example:

```
$ RUST_LOG=info cargo run -- --source=courses.json \
    load \
    --batch-size=200 \
    --scrape-vsb \
    --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
```

This takes around ~2 minutes to run on an M2 macbook pro. It includes scraping
all current 10,000+ courses offered by McGill alongside schedule information
from the [visual schedule builder](https://vsb.mcgill.ca).

For full usage information, see the output below:

```present just run load --help
Usage: server load [OPTIONS] --user-agent <USER_AGENT>

Options:
      --user-agent <USER_AGENT>      A user agent
      --course-delay <COURSE_DELAY>  Time delay between course requests in milliseconds [default: 0]
      --page-delay <PAGE_DELAY>      Time delay between page requests in milliseconds [default: 0]
      --retries <RETRIES>            Number of retries [default: 10]
      --batch-size <BATCH_SIZE>      Number of pages to scrape per concurrent batch [default: 20]
      --mcgill-term <MCGILL_TERM>    The mcgill term to scrape [default: 2023-2024]
      --vsb-terms <VSB_TERMS>        The schedule builder terms to scrape [default: 202305 202309 202401]
      --scrape-vsb                   Scrape visual schedule builder information
  -h, --help                         Print help
```

Alternatively, if you have [just](https://github.com/casey/just) installed, you
can run:

```
$ just load
```

Finally, spawn the react frontend:

```bash
$ npm install
$ npm run dev
```
