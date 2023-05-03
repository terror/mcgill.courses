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

Spawn the server with a data source (in this case the `/seed` directory)
and seed the database:

```bash
$ cargo run -- --source=seed serve --seed --db-name=mcgill-courses
```

Refer to `.env.example` and `client/.env.example` for what environment variables
need to be set.

_n.b._ The server command-line interface provides a load subcommand for scraping
all courses from various McGill course information websites and building a JSON
data source, example usage:

```
$ RUST_LOG=info cargo run -- --source=courses.json \
    load \
    --batch-size=10 \
    --page-delay=500 \
    --course-delay=500 \
    --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
```

Or alternatively if you have [just](https://github.com/casey/just) installed:

```
$ just load
```

Finally, spawn the react frontend:

```bash
$ npm install
$ npm run dev
```
