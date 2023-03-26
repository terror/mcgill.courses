export RUST_LOG := 'info'

default:
  just --list

all: forbid build test clippy lint fmt-check

build:
  cargo build

clippy:
  ./bin/clippy

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
    --batch-size=10 \
    --page-delay=500 \
    --course-delay=500 \
    --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"

restart:
  docker-compose down --volumes
  just services

run *args:
  cargo run -- {{args}}

services:
  docker-compose up -d

test:
  cargo test --all

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
