FROM oven/bun AS client

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build -- --mode production

FROM rust:1.68-buster as server

WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:buster-slim

RUN apt-get update && apt-get install -y libssl1.1 ca-certificates

COPY --from=client /app/client/dist assets
COPY --from=server /usr/src/app/seed seed
COPY --from=server /usr/src/app/target/release/server /usr/local/bin

CMD server --source seed serve --asset-dir assets --initialize --db-name mcgill-courses
