## mcgill.gg

<div>
  <img width='100px' src='https://super-static-assets.s3.amazonaws.com/6296dc83-05b5-4ba9-bd53-80e15dc04936/images/2da96950-23a6-41d9-bf58-3b65a4ee3737.png'>
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

Spawn the server with a data source:

```bash
$ cargo run -- --source=courses.json serve
```

_n.b._ The server command-line interface provides a load subcommand for
scraping all courses from various McGill course information websites and
building a JSON data source, example usage:

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
$ just extract
```

Spawn the react frontend:

```bash
$ npm install
$ npm run dev
```
