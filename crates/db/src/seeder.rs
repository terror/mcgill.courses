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

    for seed in Collector::new(&self.options.source).run()? {
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

  async fn seed<Item, Fut, F>(&self, items: Vec<Item>, runner: F) -> Result
  where
    Item: Clone + Send + 'static,
    Fut: Future<Output = Result> + Send + 'static,
    F: Fn(Db, Item) -> Fut + Send + Sync + 'static,
  {
    if self.options.multithreaded {
      let tasks = items.into_iter().map(|item| {
        let db = self.db.clone();
        tokio::task::spawn(runner(db, item))
      });

      for result in join_all(tasks).await {
        if let Err(err) = result {
          return Err(err.into());
        }
      }
    } else {
      for item in items {
        runner(self.db.clone(), item).await?;
      }
    }

    Ok(())
  }
}
