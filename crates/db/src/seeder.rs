use super::*;

#[derive(Debug)]
pub(crate) struct Seeder {
  db: Db,
  options: SeedOptions,
}

impl Seeder {
  pub(crate) fn new(db: Db, options: SeedOptions) -> Self {
    Self { db, options }
  }

  pub(crate) async fn run(self) -> Result {
    info!("Seeding the database...");

    for seed in self.collect()? {
      match seed {
        Seed::Courses((path, courses)) if !self.options.skip_courses => {
          info!("Seeding courses from {}...", path.display());

          let runner = |db: Db, item: Course| async move {
            db.add_course(item.clone()).await?;

            for instructor in item.instructors {
              db.add_instructor(instructor).await?;
            }

            Ok(())
          };

          self.seed(courses, runner).await?;
        }
        Seed::Reviews((path, reviews)) => {
          info!("Seeding reviews from {}...", path.display());

          let runner = |db: Db, item: Review| async move {
            db.add_review(item).await?;
            Ok(())
          };

          self.seed(reviews, runner).await?;
        }
        Seed::Unknown(path) => {
          warn!(
            "Unknown seed type encountered from {}, continuing...",
            path.display()
          );
        }
        _ => continue,
      }
    }

    Ok(())
  }

  fn collect(&self) -> Result<Vec<Seed>> {
    Ok(if self.options.source.is_file() {
      vec![Seed::from_content(
        self.options.source.clone(),
        fs::read_to_string(&self.options.source)?,
      )]
    } else {
      fs::read_dir(&self.options.source)?
        .map(|path| -> Result<PathBuf> { Ok(path?.path()) })
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .sorted()
        .map(|path| -> Result<Seed> {
          Ok(Seed::from_content(path.clone(), fs::read_to_string(path)?))
        })
        .collect::<Result<Vec<_>>>()?
    })
  }

  async fn seed<
    Item: Clone + Send,
    Fut: Future<Output = Result> + Send + 'static,
    F: Fn(Db, Item) -> Fut,
  >(
    &self,
    items: Vec<Item>,
    runner: F,
  ) -> Result {
    let tasks =
      self
        .options
        .multithreaded
        .then_some(items.clone().into_iter().map(|item| {
          let db = self.db.clone();
          tokio::task::spawn(runner(db, item))
        }));

    if let Some(tasks) = tasks {
      join_all(tasks)
        .await
        .into_iter()
        .collect::<Result<Vec<_>, _>>()?;
    } else {
      for item in items {
        runner(self.db.clone(), item).await?;
      }
    }

    Ok(())
  }
}
