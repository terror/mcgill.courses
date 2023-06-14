export RUST_LOG := 'info'

alias d := dev
alias f := fmt

default:
  just --list

all: forbid build test clippy lint fmt-check

build:
  cargo build && tsc

clippy:
  ./bin/clippy

dev: services
  concurrently \
    --kill-others \
    --names 'SERVER,CLIENT' \
    --prefix-colors 'green.bold,magenta.bold' \
    --prefix '[{name}] ' \
    --prefix-length 2 \
    --success first \
    --handle-input \
    --timestamp-format 'HH:mm:ss' \
    --color \
    -- \
    'just watch run serve --db-name=mcgill-courses' \
    'npm run dev'

dev-deps:
  cargo install present

e2e:
  npm run cy:e2e

fmt:
  cargo fmt --all
  npm run format

fmt-check:
  cargo fmt --all -- --check
  npm run format-check

forbid:
  ./bin/forbid

initialize *args: restart-services
  cargo run -- --source=seed serve --initialize --db-name=mcgill-courses {{args}}

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

restart-services:
  docker compose down --volumes && just services

run *args:
  cargo run -- {{args}}

serve:
  cargo run -- serve --db-name=mcgill-courses

services:
  docker compose up --no-recreate -d

test:
  cargo test --all

watch +COMMAND='test':
  cargo watch --clear --exec "{{COMMAND}}"
