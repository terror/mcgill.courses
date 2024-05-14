use {
  anyhow::{anyhow, Error},
  async_openai::types::{
    ChatCompletionRequestSystemMessageArgs, CreateChatCompletionRequestArgs,
  },
  chrono::{DateTime, Utc},
  clap::Parser,
  dotenv::dotenv,
  env_logger::Env,
  log::info,
  octocrab::{models, params},
  serde::{Deserialize, Serialize},
  std::{
    collections::{HashMap, HashSet},
    fmt::Display,
    fs::{self, File},
    path::PathBuf,
    process,
  },
};

#[derive(Debug)]
struct PullRequest<'a> {
  title: Option<&'a str>,
  description: Option<&'a str>,
  number: u64,
  url: &'a str,
  merged_at: Option<DateTime<Utc>>,
}

impl Display for PullRequest<'_> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.title.unwrap_or_default())
  }
}

impl PullRequest<'_> {
  async fn summary(&self) -> Result<Option<String>> {
    info!("Generating summary for pull request #{}", self.number);

    if self.title.is_none() && self.description.is_none() {
      return Ok(None);
    }

    let client = async_openai::Client::new();

    let mut prompt = String::new();

    prompt.push_str(&fs::read_to_string("prompt.txt")?);

    if let Some(title) = self.title {
      prompt.push_str(&format!("\nTitle of the pull request: {}\n", title));
    }

    if let Some(description) = self.description {
      prompt.push_str(&format!(
        "Description of the pull request: {}\n",
        description
      ));
    }

    let response = client
      .chat()
      .create(
        CreateChatCompletionRequestArgs::default()
          .max_tokens(512u16)
          .model("gpt-3.5-turbo")
          .messages([ChatCompletionRequestSystemMessageArgs::default()
            .content(prompt)
            .build()?
            .into()])
          .build()?,
      )
      .await?;

    let summary = response
      .choices
      .first()
      .ok_or(anyhow!("No choices in response"))?
      .message
      .content
      .as_ref()
      .ok_or(anyhow!("No content in message"))?
      .trim()
      .to_string();

    info!("Generated: {summary}");

    Ok(Some(summary))
  }
}

#[derive(Clone, Debug, Serialize, Deserialize, Eq, Hash, PartialEq)]
struct Item<'a> {
  number: u64,
  summary: Option<String>,
  url: &'a str,
}

impl Item<'_> {
  async fn try_from(pull_request: PullRequest<'_>) -> Result<Item> {
    Ok(Item {
      number: pull_request.number,
      summary: pull_request.summary().await?,
      url: pull_request.url,
    })
  }
}

type Entry<'a> = HashMap<String, HashSet<Item<'a>>>;

#[derive(Parser)]
struct Arguments {
  #[clap(long, default_value = "../../client/src/assets/changelog.json")]
  output: PathBuf,
  #[clap(long)]
  regenerate: Vec<u64>,
  #[clap(long, default_value = "mcgill.courses")]
  repo: String,
  #[clap(long, default_value = "terror")]
  user: String,
}

impl Arguments {
  async fn run(self) -> Result {
    let client = octocrab::instance();

    let page = client
      .pulls(self.user, self.repo)
      .list()
      .state(params::State::All)
      .per_page(50)
      .send()
      .await?;

    let model = client.all_pages::<models::pulls::PullRequest>(page).await?;

    info!("Reading existing entries from {}", self.output.display());

    if !self.output.exists() {
      File::create(&self.output)?;
    }

    let content = fs::read_to_string(&self.output)?;

    let existing_items = serde_json::from_str::<Entry>(&content)
      .map(|entry| {
        entry
          .into_iter()
          .flat_map(|(_, value)| {
            value.into_iter().map(|item| (item.number, item))
          })
          .collect::<HashMap<u64, Item>>()
      })
      .unwrap_or_else(|_| HashMap::new());

    let pull_requests = model
      .iter()
      .map(|pull_request| PullRequest {
        title: pull_request.title.as_deref(),
        description: pull_request.body.as_deref(),
        number: pull_request.number,
        url: pull_request.url.as_str(),
        merged_at: pull_request.merged_at,
      })
      .collect::<Vec<_>>();

    let mut grouped: Entry = HashMap::new();

    for pull_request in pull_requests {
      if let Some(merged_at) = pull_request.merged_at {
        let month = merged_at.format("%B %Y").to_string();

        if let Some(item) = existing_items.get(&pull_request.number) {
          if self.regenerate.contains(&pull_request.number) {
            grouped
              .entry(month)
              .or_insert_with(HashSet::new)
              .insert(Item::try_from(pull_request).await?);
          } else {
            grouped
              .entry(month)
              .or_insert_with(HashSet::new)
              .insert(item.clone());
          }

          continue;
        }

        grouped
          .entry(month)
          .or_insert_with(HashSet::new)
          .insert(Item::try_from(pull_request).await?);
      }
    }

    info!("Writing to {}", self.output.display());

    fs::write(self.output, serde_json::to_string_pretty(&grouped)?)?;

    Ok(())
  }
}

type Result<T = (), E = Error> = std::result::Result<T, E>;

#[tokio::main]
async fn main() {
  env_logger::Builder::from_env(Env::default().default_filter_or("info"))
    .init();

  dotenv().ok();

  if let Err(error) = Arguments::parse().run().await {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
