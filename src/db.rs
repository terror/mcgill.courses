use super::*;

use futures::stream::TryStreamExt;
use mongodb::options::UpdateModifications;

#[derive(Debug, Clone)]
pub(crate) struct Db {
  _client: Client,
}

impl Db {
  pub(crate) async fn connect(
    config: &Config,
    source: PathBuf,
  ) -> Result<Self> {
    let mut client_options = ClientOptions::parse(&config.mongodb_uri).await?;

    client_options.app_name = Some("mcgillgg".to_string());

    let client = Client::with_options(client_options)?;

    client
      .database("admin")
      .run_command(doc! {"ping": 1}, None)
      .await?;

    log::info!("Connected successfully.");

    let courses =
      serde_json::from_str::<Vec<Course>>(&fs::read_to_string(&source)?)?;

    let course_collection =
      client.database("admin").collection::<Course>("courses");

    let courses = courses.into_iter().take(1).collect::<Vec<Course>>();

    for course in courses {
      if let Some(mut found) = course_collection
        .find_one(doc! { "title": &course.title }, None)
        .await?
      {
        found.terms.extend(course.terms);

        log::info!("Found course {}", course.title);

        course_collection
          .update_one(
            doc! { "title": &course.title },
            UpdateModifications::Document(
              doc! { "$set": { "terms": found.terms } },
            ),
            None,
          )
          .await?;
      } else {
        course_collection.insert_one(course, None).await?;
      }
    }

    log::info!("Inserted courses");

    log::info!(
      "Number of courses: {:?}",
      course_collection
        .find(None, None)
        .await?
        .try_collect::<Vec<Course>>()
        .await?
    );

    Ok(Self { _client: client })
  }
}
