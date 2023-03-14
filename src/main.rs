use {
  anyhow::anyhow,
  clap::Parser,
  rayon::prelude::*,
  scraper::{ElementRef, Html, Selector},
  serde::{Deserialize, Serialize},
  std::{fs, path::PathBuf, process},
  uuid::Uuid,
};

const BASE_URL: &str = "https://www.mcgill.ca";

#[derive(Debug, Clone, Deserialize, Serialize)]
struct Course {
  pub(crate) id: String,
  pub(crate) title: String,
  pub(crate) subject: String,
  pub(crate) code: String,
  pub(crate) level: String,
  pub(crate) url: String,
  pub(crate) department: String,
  pub(crate) faculty: String,
  pub(crate) faculty_url: String,
  pub(crate) terms: Vec<String>,
  pub(crate) description: String,
  pub(crate) instructors: String,
}

trait Select<'a> {
  fn select_single(&self, selector: &str) -> Result<ElementRef<'a>>;
  fn select_optional(&self, selector: &str) -> Result<Option<ElementRef<'a>>>;
  fn select_many(&self, selector: &str) -> Result<Vec<ElementRef<'a>>>;
}

impl<'a> Select<'a> for ElementRef<'a> {
  fn select_single(&self, selector: &str) -> Result<ElementRef<'a>> {
    self
      .select(
        &Selector::parse(selector)
          .map_err(|error| anyhow!("Failed to parse selector: {:?}", error))?,
      )
      .next()
      .ok_or_else(|| anyhow!("Failed to select element"))
  }

  fn select_optional(&self, selector: &str) -> Result<Option<ElementRef<'a>>> {
    Ok(
      self
        .select(
          &Selector::parse(selector)
            .map_err(|error| anyhow!("Failed to parse selector: {:?}", error))?,
        )
        .next(),
    )
  }

  fn select_many(&self, selector: &str) -> Result<Vec<ElementRef<'a>>> {
    Ok(
      self
        .select(
          &Selector::parse(selector)
            .map_err(|error| anyhow!("Failed to parse selector: {:?}", error))?,
        )
        .into_iter()
        .collect::<Vec<ElementRef<'a>>>(),
    )
  }
}

trait VecExt<T> {
  fn into_option(self) -> Option<Self>
  where
    Self: Sized;
}

impl<T> VecExt<T> for Vec<T> {
  fn into_option(self) -> Option<Self> {
    if self.is_empty() {
      None
    } else {
      Some(self)
    }
  }
}

#[derive(Parser)]
struct Options {
  #[clap(long)]
  source: PathBuf,
}

#[derive(Parser)]
struct Arguments {
  #[clap(flatten)]
  options: Options,
  #[clap(subcommand)]
  subcommand: Subcommand,
}

impl Arguments {
  fn run(self) -> Result {
    match self.subcommand {
      Subcommand::Extract(extractor) => extractor.run(self.options.source),
      Subcommand::Serve(server) => server.run(self.options.source),
    }
  }
}

#[derive(Parser)]
enum Subcommand {
  Extract(Extractor),
  Serve(Server),
}

#[derive(Parser)]
struct Extractor {
  #[clap(long)]
  threads: usize,
}

#[derive(Debug)]
pub(crate) struct Page {
  pub(crate) number: usize,
  pub(crate) url: String,
}

impl Page {
  pub(crate) fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}

#[derive(Debug, Clone)]
pub(crate) struct Entry {
  pub(crate) department: String,
  pub(crate) faculty: String,
  pub(crate) level: String,
  pub(crate) terms: Vec<String>,
  pub(crate) url: String,
}

impl Entry {
  pub(crate) fn content(&self) -> Result<String> {
    Ok(reqwest::blocking::get(self.url.clone())?.text()?)
  }
}

impl Extractor {
  fn run(&self, source: PathBuf) -> Result {
    log::info!("Running loader...");

    let mut courses = Vec::new();

    let mut page = 0;

    while let Some(entries) = self.pages(self.aggregate(page, page + self.threads))? {
      courses.extend(
        entries
          .par_iter()
          .map(|entry| self.course(entry.clone()))
          .collect::<Result<Vec<Course>, _>>()?,
      );
      page += self.threads;
    }

    fs::write(source, serde_json::to_string(&courses)?).map_err(anyhow::Error::from)
  }

  fn aggregate(&self, start: usize, end: usize) -> Vec<Page> {
    (start..=end)
      .into_iter()
      .map(|index| Page {
        number: index,
        url: format!("{}/study/2022-2023/courses/search?page={}", BASE_URL, index),
      })
      .collect()
  }

  fn pages(&self, pages: Vec<Page>) -> Result<Option<Vec<Entry>>> {
    Ok(
      pages
        .par_iter()
        .map(|page| {
          self
            .page(page)
            .unwrap_or(Some(Vec::new()))
            .unwrap_or(Vec::new())
        })
        .flatten()
        .collect::<Vec<Entry>>()
        .into_option(),
    )
  }

  fn page(&self, page: &Page) -> Result<Option<Vec<Entry>>> {
    log::info!("Parsing html on page: {}...", page.number);

    let html = Html::parse_fragment(&page.content()?);

    let content = html
      .root_element()
      .select_optional("div[class='view-content']")?;

    if content.is_none() {
      log::info!("Did not find any content on page {}", page.number);
      return Ok(None);
    }

    log::info!("Parsing found content on page {}...", page.number);

    let results = content
      .unwrap()
      .select_many("div[class~='views-row']")?
      .iter()
      .map(|entry| -> Result<Entry> {
        Ok(Entry {
          department: entry
            .select_single("span[class~='views-field-field-dept-code']")?
            .select_single("span[class='field-content']")?
            .inner_html(),
          faculty: entry
            .select_single("span[class~='views-field-field-faculty-code']")?
            .select_single("span[class='field-content']")?
            .inner_html(),
          level: entry
            .select_single("span[class~='views-field-level']")?
            .select_single("span[class='field-content']")?
            .inner_html(),
          terms: entry
            .select_single("span[class~='views-field-terms']")?
            .select_single("span[class='field-content']")?
            .inner_html()
            .split(", ")
            .map(|term| term.to_owned())
            .collect::<Vec<String>>(),
          url: format!(
            "{}{}",
            BASE_URL,
            entry
              .select_single("div[class~='views-field-field-course-title-long']",)?
              .select_single("a")?
              .value()
              .attr("href")
              .ok_or_else(|| anyhow!("Failed to get attribute"))?
          ),
        })
      })
      .collect::<Result<Vec<Entry>, _>>();

    let entries = results?
      .into_iter()
      .filter(|entry| !entry.terms.contains(&String::from("Not Offered")))
      .collect::<Vec<Entry>>();

    log::info!("Scraped entries on page {}: {:?}", page.number, entries);

    Ok(Some(entries))
  }

  fn course(&self, entry: Entry) -> Result<Course> {
    let html = Html::parse_fragment(&entry.content()?);

    let full_title = html
      .root_element()
      .select_single("h1[id='page-title']")?
      .inner_html()
      .trim()
      .to_owned();

    let full_code = full_title
      .split(' ')
      .take(2)
      .collect::<Vec<&str>>()
      .join(" ");

    let subject = full_code
      .split(' ')
      .take(1)
      .collect::<Vec<&str>>()
      .join(" ");

    let code = full_code
      .split(' ')
      .skip(1)
      .collect::<Vec<&str>>()
      .join(" ");

    let content = html
      .root_element()
      .select_single("div[class='node node-catalog clearfix']")?;

    log::info!("Parsed course {}{}", subject, code);

    Ok(Course {
      id: Uuid::new_v5(
        &Uuid::NAMESPACE_X500,
        format!("{}-{}", subject, code).as_bytes(),
      )
      .to_string(),
      title: full_title
        .split(' ')
        .skip(2)
        .collect::<Vec<&str>>()
        .join(" "),
      subject,
      code,
      level: entry.level,
      url: entry.url,
      department: entry.department,
      faculty: entry.faculty,
      faculty_url: format!(
        "{}{}",
        BASE_URL,
        content
          .select_single("div[class='meta']")?
          .select_single("p")?
          .select_single("a")?
          .value()
          .attr("href")
          .ok_or_else(|| anyhow!("Failed to get attribute"))?
      ),
      description: content
        .select_single("div[class='content']")?
        .select_single("p")?
        .inner_html()
        .trim()
        .split(':')
        .skip(1)
        .collect::<Vec<&str>>()
        .join(" ")
        .trim()
        .to_owned(),
      terms: entry.terms,
      instructors: content
        .select_single("p[class='catalog-instructors']")?
        .inner_html()
        .trim()
        .split(' ')
        .skip(1)
        .collect::<Vec<&str>>()
        .join(" ")
        .trim()
        .to_owned(),
    })
  }
}

#[derive(Parser)]
struct Server {
  #[clap(long, default_value = "8000")]
  port: u16,
}

impl Server {
  fn run(self, _source: PathBuf) -> Result {
    Ok(())
  }
}

type Result<T = (), E = anyhow::Error> = std::result::Result<T, E>;

fn main() {
  env_logger::init();

  if let Err(error) = Arguments::parse().run() {
    eprintln!("error: {error}");
    process::exit(1);
  }
}
