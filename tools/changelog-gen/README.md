**changelog-gen** is a tool that outputs monthly-scoped AI generated summaries for
pull requests present in a GitHub repository.

We use it to populate changelog entries in `client/src/assets/changelog.json`
for display on our `/changelog` page.

### Usage

From the root directory:

```bash
cargo run --manifest-path tools/changelog-gen/Cargo.toml \
  -- \
  --output client/src/assets/changelog.json \
  {{args}}
```

n.b. The tool assumes you have a `OPENAI_API_KEY` set in the environment, as it
uses the `gpt-3.5-turbo` model to generate changelogs.
