export RUST_LOG := 'info'

default:
  just --list

all: build test clippy fmt-check

build:
  cargo build

clippy:
  cargo clippy --all-targets --all-features

extract:
  cargo run -- --source=courses.json \
    load \
    --batch-size=10 \
    --page-delay=500 \
    --course-delay=500 \
    --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"

fmt:
  cargo fmt --all
  prettier --write .

fmt-check:
  cargo fmt --all -- --check
  @echo formatting check done

restart:
  docker-compose down
  docker volume rm mcgillgg_mongodb_data
  just services

run *args:
  cargo run -- {{args}}

services:
  docker-compose up -d

test:
  cargo test --all

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
