## mcgill.gg

A course search and review platform for McGill university.

### Development

You'll need docker, cargo and npm installed on your machine to spawn the various
components the project needs to run locally.

First, mount a local postgresql instance, see `.env.example` for what
environment variables you'll need to set:

```bash
$ docker compose up -d
```

Spawn the server with a data source:

```bash
$ cargo run -- --source=crates.json serve
```

n.b. the server cli provides a load subcommand for scraping all courses from
mcgill and building a json data source.

Spawn the react frontend:

```bash
$ npm install
$ npm run dev
```
