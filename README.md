## mcgill.courses <a><img src="https://github.com/user-attachments/assets/3d835599-381c-4d82-8e71-4d80be190909" height="40" valign="top" /></a>

A course search and review platform for McGill university.

![](https://github.com/user-attachments/assets/0eee8305-c292-46fe-b5ef-075e9d083b9f)

## Development

You'll need [docker](https://www.docker.com/),
[cargo](https://doc.rust-lang.org/cargo/) and [pnpm](https://pnpm.io/) installed
on your machine to spawn the various components the project needs to run
locally.

First, join the discord server to get access to the development environment
variables:

[https://discord.gg/fSVSqfPHSV](https://discord.gg/fSVSqfPHSV)

In `.env` within the root directory you'll have to set

```
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_REDIRECT_URI=http://localhost:8000/api/auth/authorized
```

...and then in `client/.env` you'll have to set the server url

```
VITE_API_URL=http://localhost:8000
```

Second, mount a local [mongodb](https://www.mongodb.com/) instance with docker
and initiate the replica set:

```bash
docker compose up --no-recreate -d
sleep 5
docker exec mongodb mongosh --quiet --eval 'rs.initiate()' > /dev/null 2>&1 || true
```

Spawn the server with a data source (in this case the `/seed` directory) and
initialize the database (note that seeding may take some time on slower
machines):

```bash
cargo run -- --source=seed serve --initialize --db-name=mcgill-courses
```

Finally, spawn the react frontend:

```bash
pnpm install
pnpm run dev
```

_n.b._ If you have [just](https://github.com/casey/just) installed, we provide a
`dev` recipe for doing all of the above in addition to running a watch on the
server:

```bash
just dev
```

See the
[justfile](https://github.com/terror/mcgill.courses/blob/master/justfile) for
more recipes.

### Gathering seed data

The server command-line interface provides a load subcommand for scraping all
courses from various McGill course information websites and building a JSON data
source, for example:

```
RUST_LOG=info cargo run -- --source=seed \
  load \
  --batch-size=200 \
  --scrape-vsb \
  --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
```

The current defaults include scraping all current 10,000+ courses offered by
McGill, current schedule information from the official
[visual schedule builder](https://vsb.mcgill.ca), and courses offered in
previous terms going back as far the 2009-2010 term.

For full usage information, see the output below:

```present just run load --help
Usage: server load [OPTIONS] --user-agent <USER_AGENT>

Options:
      --user-agent <USER_AGENT>      A user agent
      --course-delay <COURSE_DELAY>  Time delay between course requests in milliseconds [default: 0]
      --retries <RETRIES>            Number of retries [default: 10]
      --batch-size <BATCH_SIZE>      Number of pages to scrape per concurrent batch [default: 20]
      --mcgill-terms <MCGILL_TERMS>  The mcgill terms to scrape [default: 2009-2010 2010-2011 2011-2012 2012-2013 2013-2014 2014-2015 2015-2016 2016-2017 2017-2018 2018-2019 2019-2020 2020-2021 2021-2022 2022-2023 2023-2024 2024-2025]
      --vsb-terms <VSB_TERMS>        The schedule builder terms to scrape [default: 202405 202409 202501]
      --scrape-vsb                   Scrape visual schedule builder information
  -h, --help                         Print help
```

Alternatively, if you have [just](https://github.com/casey/just) installed, you
can run:

```
just load
```

## Tools

We have a few tools that we use throughout the project, below documents some of
them. You can find them all under the
[`/tools`](https://github.com/terror/mcgill.courses/tree/master/tools) directory
from the project root.

For python-based tools, we highly recommend you install
[uv](https://docs.astral.sh/uv/) on your system. On macOS or linux, you can do
it as follows:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Follow the
[documentation](https://docs.astral.sh/uv/getting-started/installation/) for
other systems.

### `changelog-generator`

Our changelog page
([https://mcgill.courses/changelog](https://mcgill.courses/changelog)) is
automated by this tool.

We feed PR titles and descriptions to a large language model (in this case
hard-coded to GPT-3.5) to generate a user-friendly summary using
[this prompt](https://github.com/terror/mcgill.courses/blob/master/tools/changelog-generator/prompt.txt).

The tool assumes you have an [OpenAI](https://openai.com/) API key set in the
environment, and you can use it from the project root like:

```bash
cargo run --manifest-path tools/changelog-generator/Cargo.toml \
  -- \
  --output client/src/assets/changelog.json
```

This will run the changelog generator on all
[up-to-date merged PRs](https://github.com/terror/mcgill.courses/pulls?q=is:pr+is:closed)
from our GitHub repository, populating
[`changelog.json`](https://github.com/terror/mcgill.courses/blob/master/client/src/assets/changelog.json)
with the results.

There are a few other options the tool supports:

```present cargo run --manifest-path tools/changelog-generator/Cargo.toml -- --help
Usage: changelog-generator [OPTIONS]

Options:
      --output <OUTPUT>               [default: ../../client/src/assets/changelog.json]
      --regenerate [<REGENERATE>...]
      --regenerate-all
      --repo <REPO>                   [default: mcgill.courses]
      --user <USER>                   [default: terror]
  -h, --help                          Print help
```

For instance, you can regenerate single entries by specifying their pull request
number.

### `course-average-fetcher`

This tool is used to populate a
[JSON file](https://github.com/terror/mcgill.courses/blob/master/client/src/assets/courseAveragesData.json)
with course average information we display on
[course pages](https://mcgill.courses/course/econ208).

We read and parse a
[crowdsourced google sheet](https://docs.google.com/spreadsheets/d/1NGUBQuF8FI6ebna86S1RHpc27srxpMbaSyjipIkr-gk/edit?gid=233834959#gid=233834959)
with historical course averages provided generously by the
[McGill enhanced](https://demetrios-koziris.github.io/McGillEnhanced/) team.

### `requirement-parser`

We parse prerequisites and corequisites using a fine-tuned large language model
with custom examples, all the code lives in
[`/tools/requirement-parser`](https://github.com/terror/mcgill.courses/tree/master/tools/req-parser).

If you need to run the requirement parser on a file, simply:

```bash
cd tools/requirement-parser
uv sync
uv run main.py <file>
```

_n.b._ This will require an [OpenAI](https://openai.com/) API key and the name
of the fine-tuned model to be set in the environment.

For more information about how this works, check out our
[research project](https://github.com/SamZhang02/llmbda).

### `search-index-aggregator`

This tool selectively includes only the
[JSON fields](https://github.com/terror/mcgill.courses/blob/master/client/src/assets/searchData.json)
(from database
[seed files](https://github.com/terror/mcgill.courses/tree/master/seed))
required by the search component, significantly reducing payload size and
improving resource efficiency.

## Deployment

We continuously deploy our site with [Render](https://render.com/) using a
[docker image](https://github.com/terror/mcgill.courses/blob/master/Dockerfile),
and have a [MongoDB](https://en.wikipedia.org/wiki/MongoDB?useskin=vector)
instance hosted on [Atlas](https://www.mongodb.com/atlas/database).

We also use
[S3](https://aws.amazon.com/pm/serv-s3/?trk=936e5692-d2c9-4e52-a837-088366a7ac3f&sc_channel=ps)
to host a bucket for referring to a hash when deciding whether or not to seed
courses in our production environment, and Microsoft's
[identity platform](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
for handling our OAuth 2.0
[authentication flow](https://github.com/terror/mcgill.courses/blob/master/src/auth.rs).

## Prior Art

There are a few notable projects worth mentioning that are similar in nature to
[mcgill.courses](https://mcgill.courses), and have either led to inspiration or
new ideas with regard to its functionality and design, namely:

- [uwflow.com](https://uwflow.com/) - A course search and review platform for
  the University of Waterloo
- [cloudberry.fyi](https://www.cloudberry.fyi/) - A post-modern schedule builder
  for McGill students
- [mcgill.wtf](https://github.com/terror/mcgill.wtf) - A fast full-text search
  engine for McGill courses
