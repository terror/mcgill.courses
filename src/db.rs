use super::*;

use futures::stream::TryStreamExt;
use itertools::Itertools;
use model::Instructor;
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

    client_options.app_name = Some("mcgill.gg".to_string());

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

    let courses = vec![courses
      .into_iter()
      .find(|course| course.title == "Discrete Structures")
      .unwrap()];

    for course in courses {
      if let Some(found) = course_collection
        .find_one(doc! { "title": &course.title }, None)
        .await?
      {
        let terms = [course.terms, found.terms]
          .concat()
          .iter()
          .unique()
          .cloned()
          .collect::<Vec<String>>();

        let instructors = [course.instructors, found.instructors]
          .concat()
          .iter()
          .unique()
          .cloned()
          .collect::<Vec<Instructor>>();

        let schedule = [course.schedule, found.schedule]
          .concat()
          .iter()
          .unique()
          .cloned()
          .collect::<Vec<Schedule>>();

        course_collection
          .update_one(
            doc! { "title": &course.title },
            UpdateModifications::Document(doc! {
              "$set": {
                "corequisites": course.corequisites,
                "credits": course.credits,
                "description": course.description,
                "faculty_url": course.faculty_url,
                "instructors": instructors,
                "prerequisites": found.prerequisites,
                "schedule": schedule,
                "terms": terms,
                "url": course.url
              }
            }),
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
