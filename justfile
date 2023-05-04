export RUST_LOG := 'info'

default:
  just --list

all: forbid build test clippy lint fmt-check readme

build:
  cargo build

clippy:
  ./bin/clippy

dev-deps:
  cargo install present

fmt:
  cargo fmt --all
  npm run format

fmt-check:
  cargo fmt --all -- --check
  npm run format-check

forbid:
  ./bin/forbid

lint:
  npm run lint

load:
  cargo run -- --source=courses.json \
    load \
    --batch-size=200 \
    --scrape-vsb \
    --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"

readme:
  present --in-place README.md
  @prettier --write README.md

restart:
  docker-compose down --volumes && just services

run *args:
  cargo run -- {{args}}

seed:
  cargo run -- --source=seed serve --seed --db-name=mcgill-courses

serve:
  cargo run -- serve --db-name=mcgill-courses

services:
  docker-compose up -d

test:
  cargo test --all

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
