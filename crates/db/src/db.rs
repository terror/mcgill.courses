use super::*;

#[derive(Debug, Clone)]
pub struct Db {
  database: Database,
}

impl Db {
  const COURSE_COLLECTION: &str = "courses";

  pub async fn connect(db_name: &str) -> Result<Self> {
    let mut client_options =
      ClientOptions::parse(format!("mongodb://localhost:27017/{}", db_name))
        .await?;

    client_options.app_name = Some(db_name.to_string());

    let client = Client::with_options(client_options)?;

    client
      .database(db_name)
      .run_command(doc! {"ping": 1}, None)
      .await?;

    info!("Connected successfully.");

    Ok(Self {
      database: client.database(db_name),
    })
  }

  pub async fn seed(&self, source: PathBuf) -> Result {
    info!("Seeding courses...");

    for course in
      serde_json::from_str::<Vec<Course>>(&fs::read_to_string(&source)?)?
    {
      match self
        .find_course(doc! {
          "title": &course.title,
          "subject": &course.subject,
          "code": &course.code
        })
        .await?
      {
        Some(found) => {
          self
            .update_course(
              doc! { "title": &course.title },
              doc! {
                "$set": {
                  "corequisites": course.corequisites,
                  "credits": course.credits,
                  "description": course.description,
                  "facultyUrl": course.faculty_url,
                  "instructors": course.instructors.combine(found.instructors),
                  "prerequisites": course.prerequisites,
                  "restrictions": course.restrictions,
                  "schedule": course.schedule.combine(found.schedule),
                  "terms": course.terms.combine(found.terms),
                  "url": course.url
                }
              },
            )
            .await?;
        }
        None => {
          self.add_course(course).await?;
        }
      }
    }

    info!("Finished seeding courses, building index...");

    self
      .create_course_index(
        doc! {
          "subject": "text",
          "code": "text",
          "title": "text",
          "description": "text"
        },
        doc! {
          "subject": 3,
          "code": 3,
          "title": 2,
          "description": 1
        },
      )
      .await?;

    info!("Course index complete.");

    Ok(())
  }

  pub async fn courses(&self) -> Result<Vec<Course>> {
    Ok(
      self
        .database
        .collection::<Course>(Db::COURSE_COLLECTION)
        .find(None, None)
        .await?
        .try_collect::<Vec<Course>>()
        .await?,
    )
  }

  pub async fn search(&self, query: &str) -> Result<Vec<Course>> {
    info!("Received query: {query}");

    Ok(
      self
        .database
        .collection::<Course>(Db::COURSE_COLLECTION)
        .find(
          doc! { "$text" : { "$search": query } },
          FindOptions::builder()
            .sort(doc! { "score": { "$meta" : "textScore" }})
            .limit(10)
            .build(),
        )
        .await?
        .try_collect::<Vec<Course>>()
        .await?,
    )
  }

  pub async fn find_course_by_id(
    &self,
    id: ObjectId,
  ) -> Result<Option<Course>> {
    self.find_course(doc! { "_id": id }).await
  }

  async fn find_course(&self, query: Document) -> Result<Option<Course>> {
    Ok(
      self
        .database
        .collection::<Course>(Db::COURSE_COLLECTION)
        .find_one(query, None)
        .await?,
    )
  }

  async fn add_course(&self, course: Course) -> Result<InsertOneResult> {
    Ok(
      self
        .database
        .collection::<Course>(Db::COURSE_COLLECTION)
        .insert_one(course, None)
        .await?,
    )
  }

  async fn update_course(
    &self,
    query: Document,
    update: Document,
  ) -> Result<UpdateResult> {
    Ok(
      self
        .database
        .collection::<Course>(Db::COURSE_COLLECTION)
        .update_one(query, UpdateModifications::Document(update), None)
        .await?,
    )
  }

  async fn create_course_index(
    &self,
    keys: Document,
    weights: Document,
  ) -> Result<CreateIndexResult> {
    Ok(
      self
        .database
        .collection::<Course>(Db::COURSE_COLLECTION)
        .create_index(
          IndexModel::builder()
            .keys(keys)
            .options(IndexOptions::builder().weights(weights).build())
            .build(),
          None,
        )
        .await?,
    )
  }
}

#[cfg(test)]
mod tests {
  use {super::*, pretty_assertions::assert_eq};

  static SEED_DIR: Dir<'_> = include_dir!("crates/db/seeds");

  fn get_content(name: &str) -> String {
    SEED_DIR
      .get_file(name)
      .unwrap()
      .contents_utf8()
      .unwrap()
      .to_string()
  }

  struct TestContext {
    db: Db,
    db_name: String,
  }

  impl TestContext {
    async fn new() -> Self {
      static TEST_DATABASE_NUMBER: AtomicUsize = AtomicUsize::new(0);

      let test_database_number =
        TEST_DATABASE_NUMBER.fetch_add(1, Ordering::Relaxed);

      let db_name = format!(
        "mcgill-gg-test-{}-{}",
        std::time::SystemTime::now()
          .duration_since(std::time::SystemTime::UNIX_EPOCH)
          .unwrap()
          .as_millis(),
        test_database_number,
      );

      let db = Db::connect(&db_name).await.unwrap();

      TestContext { db, db_name }
    }
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn on_disk_database_is_persistant() {
    let TestContext { db, db_name } = TestContext::new().await;

    assert_eq!(db.courses().await.unwrap().len(), 0);

    db.add_course(Course::default()).await.unwrap();

    assert_eq!(db.courses().await.unwrap().len(), 1);

    drop(db);

    let db = Db::connect(&db_name).await.unwrap();

    assert_eq!(db.courses().await.unwrap().len(), 1);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn course_seeding_is_accurate() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("before_update.json")).unwrap();

    db.seed(source).await.unwrap();

    assert_eq!(db.courses().await.unwrap().len(), 2);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn course_seeding_does_not_insert_duplicates() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(
      &source,
      serde_json::to_string(
        &(0..10).map(|_| Course::default()).collect::<Vec<Course>>(),
      )
      .unwrap(),
    )
    .unwrap();

    db.seed(source).await.unwrap();

    assert_eq!(db.courses().await.unwrap().len(), 1);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn courses_get_updated_when_seeding() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("before_update.json")).unwrap();

    db.seed(source.clone()).await.unwrap();

    assert_eq!(db.courses().await.unwrap().len(), 2);

    fs::write(&source, get_content("update.json")).unwrap();

    db.seed(source).await.unwrap();

    let courses = dbg!(db.courses().await.unwrap());

    assert_eq!(courses.len(), 3);

    assert_eq!(
      courses,
      serde_json::from_str::<Vec<Course>>(&get_content("after_update.json"))
        .unwrap()
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn search_is_accurate() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.seed(source.clone()).await.unwrap();

    assert_eq!(db.courses().await.unwrap().len(), 83);

    let courses = db.search("COMP 202").await.unwrap();

    assert_eq!(courses.len(), 10);

    let first = courses.first().unwrap();

    assert_eq!(first.subject, "COMP");
    assert_eq!(first.code, "202");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn get_course_by_id() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.seed(source.clone()).await.unwrap();

    let courses = db.courses().await.unwrap();

    assert_eq!(courses.len(), 83);

    let first = courses.first().unwrap();

    assert_eq!(
      db.find_course_by_id(first.id).await.unwrap().unwrap(),
      *first
    );
  }
}
