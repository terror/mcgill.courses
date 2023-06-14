use super::*;

#[derive(Debug, Clone)]
pub struct Db {
  database: Database,
}

impl Db {
  const COURSE_COLLECTION: &str = "courses";
  const INSTRUCTOR_COLLECTION: &str = "instructors";
  const LIKE_COLLECTION: &str = "likes";
  const REVIEW_COLLECTION: &str = "reviews";

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

    info!("Connected to MongoDB.");

    Ok(Self {
      database: client.database(db_name),
    })
  }

  pub fn name(&self) -> String {
    self.database.name().to_string()
  }

  pub async fn initialize(&self, options: InitializeOptions) -> Result {
    Initializer::new(self.clone(), options).run().await
  }

  pub async fn courses(
    &self,
    limit: Option<i64>,
    offset: Option<u64>,
    course_subjects: Option<Vec<String>>,
    course_levels: Option<Vec<String>>,
    course_terms: Option<Vec<String>>,
  ) -> Result<Vec<Course>> {
    let mut document = Document::new();

    if let Some(course_subjects) = course_subjects {
      document.insert(
        "subject",
        doc! { "$regex": format!("^({})", course_subjects.join("|")) },
      );
    }

    if let Some(course_levels) = course_levels {
      document.insert(
        "code",
        doc! { "$regex": format!("^({})", course_levels.join("|")) },
      );
    }

    if let Some(course_terms) = course_terms {
      document.insert(
        "terms",
        doc! { "$regex": format!("^({})", course_terms.join("|")) },
      );
    }

    Ok(
      self
        .database
        .collection::<Course>(Self::COURSE_COLLECTION)
        .find(
          (!document.is_empty()).then_some(document),
          FindOptions::builder().skip(offset).limit(limit).build(),
        )
        .await?
        .try_collect::<Vec<Course>>()
        .await?,
    )
  }

  pub async fn search(&self, query: &str) -> Result<SearchResults> {
    Ok(SearchResults {
      courses: self
        .text_search::<Course>(Self::COURSE_COLLECTION, query, 4)
        .await?
        .try_collect()
        .await?,
      instructors: self
        .text_search::<Instructor>(Self::INSTRUCTOR_COLLECTION, query, 2)
        .await?
        .try_collect()
        .await?,
    })
  }

  pub async fn find_course_by_id(&self, id: &str) -> Result<Option<Course>> {
    self.find_course(doc! { "_id": id }).await
  }

  pub async fn add_review(&self, review: Review) -> Result<InsertOneResult> {
    if self
      .find_review(&review.course_id, &review.user_id)
      .await?
      .is_some()
    {
      Err(anyhow!("Cannot review this course twice"))
    } else {
      Ok(
        self
          .database
          .collection::<Review>(Self::REVIEW_COLLECTION)
          .insert_one(review, None)
          .await?,
      )
    }
  }

  pub async fn update_review(&self, review: Review) -> Result<UpdateResult> {
    Ok(
      self
        .database
        .collection::<Review>(Self::REVIEW_COLLECTION)
        .update_one(
          doc! {
            "courseId": review.course_id,
            "userId": review.user_id
          },
          UpdateModifications::Document(doc! {
            "$set": {
              "content": &review.content,
              "instructors": &review.instructors,
              "rating": review.rating,
              "timestamp": review.timestamp
            },
          }),
          None,
        )
        .await?,
    )
  }

  pub async fn delete_review(
    &self,
    course_id: &str,
    user_id: &str,
  ) -> Result<DeleteResult> {
    Ok(
      self
        .database
        .collection::<Review>(Self::REVIEW_COLLECTION)
        .delete_one(
          doc! {
            "courseId": course_id,
            "userId": user_id
          },
          None,
        )
        .await?,
    )
  }

  pub async fn find_reviews_by_course_id(
    &self,
    course_id: &str,
  ) -> Result<Vec<Review>> {
    self.find_reviews(doc! { "courseId": course_id }).await
  }

  pub async fn find_reviews_by_user_id(
    &self,
    user_id: &str,
  ) -> Result<Vec<Review>> {
    self.find_reviews(doc! { "userId": user_id }).await
  }

  pub async fn find_reviews_by_instructor_name(
    &self,
    instructor_name: &str,
  ) -> Result<Vec<Review>> {
    self
      .find_reviews(doc! { "instructors": { "$in": vec![instructor_name] } })
      .await
  }

  pub async fn find_review(
    &self,
    course_id: &str,
    user_id: &str,
  ) -> Result<Option<Review>> {
    Ok(
      self
        .database
        .collection::<Review>(Self::REVIEW_COLLECTION)
        .find_one(doc! { "courseId": course_id, "userId": user_id }, None)
        .await?,
    )
  }

  pub async fn add_like(&self, like: Like) -> Result<InsertOneResult> {
    if self
      .find_like(&like.course_id, &like.user_id)
      .await?
      .is_some()
    {
      Err(anyhow!("Cannot like this review twice"))
    } else {
      Ok(
        self
          .database
          .collection::<Like>(Self::LIKE_COLLECTION)
          .insert_one(like, None)
          .await?,
      )
    }
  }

  pub async fn remove_like(&self, like: Like) -> Result<DeleteResult> {
    Ok(
      self
        .database
        .collection::<Like>(Self::LIKE_COLLECTION)
        .delete_one(
          doc! {
            "courseId": like.course_id,
            "userId": like.user_id
          },
          None,
        )
        .await?,
    )
  }

  pub async fn likes_for_review(
    &self,
    course_id: &str,
    user_id: &str,
  ) -> Result<Vec<Like>> {
    Ok(
      self
        .database
        .collection::<Like>(Self::LIKE_COLLECTION)
        .find(doc! { "courseId": course_id, "userId": user_id }, None)
        .await?
        .try_collect::<Vec<Like>>()
        .await?,
    )
  }

  async fn find_like(
    &self,
    course_id: &str,
    user_id: &str,
  ) -> Result<Option<Like>> {
    Ok(
      self
        .database
        .collection::<Like>(Self::LIKE_COLLECTION)
        .find_one(doc! { "courseId": course_id, "userId": user_id }, None)
        .await?,
    )
  }

  async fn find_reviews(&self, query: Document) -> Result<Vec<Review>> {
    Ok(
      self
        .database
        .collection::<Review>(Self::REVIEW_COLLECTION)
        .find(query, None)
        .await?
        .try_collect::<Vec<Review>>()
        .await?,
    )
  }

  async fn find_course(&self, query: Document) -> Result<Option<Course>> {
    Ok(
      self
        .database
        .collection::<Course>(Self::COURSE_COLLECTION)
        .find_one(query, None)
        .await?,
    )
  }

  pub(crate) async fn add_course(&self, course: Course) -> Result {
    match self.find_course(doc! { "_id": &course.id }).await? {
      Some(found) => {
        self
          .update_course(
            doc! { "_id": &course.id },
            doc! {
              "$set": {
                "corequisites": course.corequisites,
                "credits": course.credits,
                "description": course.description,
                "facultyUrl": course.faculty_url,
                "instructors": course.instructors.combine(found.instructors),
                "level": course.level,
                "prerequisites": course.prerequisites,
                "restrictions": course.restrictions,
                "schedule": course.schedule.combine_opt(found.schedule),
                "terms": course.terms.combine(found.terms),
                "title": course.title,
                "url": course.url
              }
            },
          )
          .await?;
      }
      None => {
        self
          .database
          .collection::<Course>(Self::COURSE_COLLECTION)
          .insert_one(
            Course {
              id_ngrams: Some(course.id.ngrams()),
              title_ngrams: Some(course.title.filter_stopwords().ngrams()),
              ..course
            },
            None,
          )
          .await?;
      }
    }

    Ok(())
  }

  async fn update_course(
    &self,
    query: Document,
    update: Document,
  ) -> Result<UpdateResult> {
    Ok(
      self
        .database
        .collection::<Course>(Self::COURSE_COLLECTION)
        .update_one(query, UpdateModifications::Document(update), None)
        .await?,
    )
  }

  async fn text_search<T>(
    &self,
    collection: &str,
    query: &str,
    limit: i64,
  ) -> Result<Cursor<T>>
  where
    T: Serialize + DeserializeOwned,
  {
    Ok(
      self
        .database
        .collection::<T>(collection)
        .find(
          doc! {
            "$text": {
              "$search": query
            }
          },
          FindOptions::builder()
            .sort(doc! { "score": { "$meta" : "textScore" }})
            .limit(limit)
            .build(),
        )
        .await?,
    )
  }

  pub(crate) async fn create_index<T>(
    &self,
    collection: &str,
    keys: Document,
    weights: Document,
  ) -> Result<CreateIndexResult>
  where
    T: Serialize + DeserializeOwned,
  {
    Ok(
      self
        .database
        .collection::<T>(collection)
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

  pub(crate) async fn add_instructor(&self, instructor: Instructor) -> Result {
    if self
      .find_instructor_by_name(&instructor.name)
      .await?
      .is_none()
    {
      self
        .database
        .collection::<Instructor>(Self::INSTRUCTOR_COLLECTION)
        .insert_one(
          Instructor {
            name_ngrams: Some(instructor.name.ngrams()),
            ..instructor
          },
          None,
        )
        .await?;
    };

    Ok(())
  }

  async fn find_instructor(
    &self,
    query: Document,
  ) -> Result<Option<Instructor>> {
    Ok(
      self
        .database
        .collection::<Instructor>(Self::INSTRUCTOR_COLLECTION)
        .find_one(query, None)
        .await?,
    )
  }

  pub async fn find_instructor_by_name(
    &self,
    name: &str,
  ) -> Result<Option<Instructor>> {
    self.find_instructor(doc! { "name": name }).await
  }

  #[cfg(test)]
  async fn reviews(&self) -> Result<Vec<Review>> {
    Ok(
      self
        .database
        .collection::<Review>(Self::REVIEW_COLLECTION)
        .find(None, None)
        .await?
        .try_collect::<Vec<Review>>()
        .await?,
    )
  }

  #[cfg(test)]
  async fn instructors(&self) -> Result<Vec<Instructor>> {
    Ok(
      self
        .database
        .collection::<Instructor>(Self::INSTRUCTOR_COLLECTION)
        .find(None, None)
        .await?
        .try_collect::<Vec<Instructor>>()
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
  async fn on_disk_database_is_persistent() {
    let TestContext { db, db_name } = TestContext::new().await;

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      0
    );

    db.add_course(Course::default()).await.unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      1
    );

    drop(db);

    let db = Db::connect(&db_name).await.unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      1
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn course_seeding_is_accurate() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("before_update.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      2
    );
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

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      1
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn courses_get_updated_when_seeding() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("before_update.json")).unwrap();

    db.initialize(InitializeOptions {
      source: source.clone(),
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      2
    );

    fs::write(&source, get_content("update.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    let courses = db.courses(None, None, None, None, None).await.unwrap();

    assert_eq!(courses.len(), 3);

    assert_eq!(
      courses,
      serde_json::from_str::<Vec<Course>>(&get_content("after_update.json"))
        .unwrap()
        .into_iter()
        .map(|c| Course {
          id_ngrams: Some(c.id.ngrams()),
          title_ngrams: Some(c.title.filter_stopwords().ngrams()),
          ..c
        })
        .collect::<Vec<Course>>()
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn search_is_accurate() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      123
    );

    let results = db.search("COMP 202").await.unwrap();

    assert_eq!(results.courses.len(), 4);

    let first = results.courses.first().unwrap();

    assert_eq!(first.subject, "COMP");
    assert_eq!(first.code, "202");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn get_course_by_id() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    let courses = db.courses(None, None, None, None, None).await.unwrap();

    assert_eq!(courses.len(), 123);

    let first = courses.first().unwrap();

    assert_eq!(
      db.find_course_by_id(&first.id).await.unwrap().unwrap(),
      *first
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn search_course_by_id_exact() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      123
    );

    let results = db.search("COMP202").await.unwrap();

    assert_eq!(results.courses.len(), 1);

    let first = results.courses.first().unwrap();

    assert_eq!(first.subject, "COMP");
    assert_eq!(first.code, "202");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn fuzzy_search_course_by_title() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      123
    );

    let results = db.search("foundations of").await.unwrap();

    assert_eq!(results.courses.len(), 1);

    let first = results.courses.first().unwrap();

    assert_eq!(first.subject, "COMP");
    assert_eq!(first.code, "202");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn get_courses_with_limit() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(Some(10), None, None, None, None)
        .await
        .unwrap()
        .len(),
      10
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn get_courses_with_offset() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, Some(20), None, None, None)
        .await
        .unwrap()
        .len(),
      103
    );
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn add_reviews() {
    let TestContext { db, .. } = TestContext::new().await;

    let reviews = vec![
      Review {
        content: "foo".into(),
        course_id: "MATH240".into(),
        instructors: vec![String::from("test")],
        rating: 5,
        user_id: "1".into(),
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        course_id: "MATH240".into(),
        instructors: vec![String::from("test")],
        rating: 5,
        user_id: "2".into(),
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        course_id: "MATH240".into(),
        instructors: vec![String::from("test")],
        rating: 5,
        user_id: "3".into(),
        ..Default::default()
      },
    ];

    for review in &reviews {
      db.add_review(review.clone()).await.unwrap();
    }

    assert_eq!(db.reviews().await.unwrap().len(), 3);
    assert_eq!(db.reviews().await.unwrap(), reviews);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn find_reviews_by_course_id() {
    let TestContext { db, .. } = TestContext::new().await;

    let reviews = vec![
      Review {
        content: "foo".into(),
        user_id: "1".into(),
        instructors: vec![String::from("test")],
        rating: 5,
        course_id: "MATH240".into(),
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        user_id: "2".into(),
        instructors: vec![String::from("test")],
        rating: 5,
        course_id: "MATH240".into(),
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        user_id: "3".into(),
        instructors: vec![String::from("test")],
        rating: 5,
        course_id: "MATH340".into(),
        ..Default::default()
      },
    ];

    for review in &reviews {
      db.add_review(review.clone()).await.unwrap();
    }

    assert_eq!(db.reviews().await.unwrap().len(), 3);
    assert_eq!(db.reviews().await.unwrap(), reviews);

    assert_eq!(
      db.find_reviews_by_course_id("MATH240").await.unwrap(),
      vec![
        Review {
          content: "foo".into(),
          user_id: "1".into(),
          instructors: vec![String::from("test")],
          rating: 5,
          course_id: "MATH240".into(),
          ..Default::default()
        },
        Review {
          content: "foo".into(),
          course_id: "MATH240".into(),
          instructors: vec![String::from("test")],
          rating: 5,
          user_id: "2".into(),
          ..Default::default()
        }
      ]
    )
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn find_reviews_by_user_id() {
    let TestContext { db, .. } = TestContext::new().await;

    let reviews = vec![
      Review {
        content: "foo".into(),
        user_id: "1".into(),
        course_id: "MATH240".into(),
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        user_id: "2".into(),
        course_id: "MATH240".into(),
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        user_id: "3".into(),
        course_id: "MATH340".into(),
        ..Default::default()
      },
    ];

    for review in &reviews {
      db.add_review(review.clone()).await.unwrap();
    }

    assert_eq!(db.reviews().await.unwrap().len(), 3);
    assert_eq!(db.reviews().await.unwrap(), reviews);

    assert_eq!(
      db.find_reviews_by_user_id("2").await.unwrap(),
      vec![Review {
        content: "foo".into(),
        user_id: "2".into(),
        course_id: "MATH240".into(),
        ..Default::default()
      },]
    )
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn find_reviews_by_user_instructor_name() {
    let TestContext { db, .. } = TestContext::new().await;

    let reviews = vec![
      Review {
        content: "foo".into(),
        user_id: "1".into(),
        course_id: "MATH240".into(),
        instructors: vec![
          String::from("test"),
          String::from("foo"),
          String::from("bar"),
        ],
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        user_id: "2".into(),
        course_id: "MATH240".into(),
        instructors: vec![String::from("test"), String::from("foo")],
        ..Default::default()
      },
      Review {
        content: "foo".into(),
        user_id: "3".into(),
        course_id: "MATH340".into(),
        instructors: vec![String::from("foo"), String::from("bar")],
        ..Default::default()
      },
    ];

    for review in &reviews {
      db.add_review(review.clone()).await.unwrap();
    }

    assert_eq!(db.reviews().await.unwrap().len(), 3);
    assert_eq!(db.reviews().await.unwrap(), reviews);

    assert_eq!(
      db.find_reviews_by_instructor_name("test").await.unwrap(),
      vec![
        Review {
          content: "foo".into(),
          user_id: "1".into(),
          course_id: "MATH240".into(),
          instructors: vec![
            String::from("test"),
            String::from("foo"),
            String::from("bar"),
          ],
          ..Default::default()
        },
        Review {
          content: "foo".into(),
          user_id: "2".into(),
          course_id: "MATH240".into(),
          instructors: vec![String::from("test"), String::from("foo")],
          ..Default::default()
        },
      ]
    )
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn dont_add_multiple_reviews_per_user() {
    let TestContext { db, .. } = TestContext::new().await;

    let review = Review {
      user_id: "1".into(),
      course_id: "MATH240".into(),
      ..Default::default()
    };

    db.add_review(review.clone()).await.unwrap();

    assert!(db.add_review(review).await.is_err());
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn update_review() {
    let TestContext { db, .. } = TestContext::new().await;

    db.add_review(Review {
      content: "foo".into(),
      course_id: "MATH240".into(),
      instructors: vec![String::from("bar")],
      rating: 5,
      difficulty: 5,
      user_id: "1".into(),
      timestamp: DateTime::from_chrono::<Utc>(Utc::now()),
    })
    .await
    .unwrap();

    let timestamp = DateTime::from_chrono::<Utc>(Utc::now());

    assert_eq!(
      db.update_review(Review {
        content: "bar".into(),
        course_id: "MATH240".into(),
        instructors: vec![String::from("foo")],
        rating: 4,
        difficulty: 4,
        user_id: "1".into(),
        timestamp
      })
      .await
      .unwrap()
      .modified_count,
      1
    );

    assert_eq!(
      db.update_review(Review {
        content: "bar".into(),
        course_id: "MATH240".into(),
        instructors: vec![String::from("foo")],
        rating: 4,
        difficulty: 4,
        user_id: "2".into(),
        ..Default::default()
      })
      .await
      .unwrap()
      .modified_count,
      0
    );

    let review = db.find_review("MATH240", "1").await.unwrap().unwrap();

    assert_eq!(review.content, "bar");
    assert_eq!(review.instructors, vec![String::from("foo")]);
    assert_eq!(review.rating, 4);
    assert_eq!(review.timestamp, timestamp);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn delete_review() {
    let TestContext { db, .. } = TestContext::new().await;

    db.add_review(Review {
      content: "foo".into(),
      course_id: "MATH240".into(),
      user_id: "1".into(),
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.delete_review("MATH240", "2")
        .await
        .unwrap()
        .deleted_count,
      0
    );

    assert_eq!(
      db.delete_review("MATH240", "1")
        .await
        .unwrap()
        .deleted_count,
      1
    );

    assert_eq!(db.find_review("MATH240", "1").await.unwrap(), None);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn delete_review_then_add_again() {
    let TestContext { db, .. } = TestContext::new().await;

    db.add_review(Review {
      content: "foo".into(),
      course_id: "MATH240".into(),
      user_id: "1".into(),
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.delete_review("MATH240", "1")
        .await
        .unwrap()
        .deleted_count,
      1
    );

    assert!(db
      .add_review(Review {
        content: "foo".into(),
        course_id: "MATH240".into(),
        user_id: "1".into(),
        ..Default::default()
      })
      .await
      .is_ok());
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn filter_courses_by_subject() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("mix.json")).unwrap();

    db.initialize(InitializeOptions {
      source,

      ..Default::default()
    })
    .await
    .unwrap();

    let total = db.courses(None, None, None, None, None).await.unwrap();

    assert_eq!(total.len(), 314);

    let filtered = db
      .courses(None, None, Some(vec!["MATH".into()]), None, None)
      .await
      .unwrap();

    assert!(filtered.len() < total.len());

    for course in filtered {
      assert_eq!(course.subject, "MATH");
    }
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn filter_courses_by_level() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("mix.json")).unwrap();

    db.initialize(InitializeOptions {
      source,

      ..Default::default()
    })
    .await
    .unwrap();

    let total = db.courses(None, None, None, None, None).await.unwrap();

    assert_eq!(total.len(), 314);

    let filtered = db
      .courses(None, None, None, Some(vec!["100".into()]), None)
      .await
      .unwrap();

    assert!(filtered.len() < total.len());

    for course in filtered {
      assert!(course.code.starts_with('1'));
    }
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn filter_courses_by_term() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("mix.json")).unwrap();

    db.initialize(InitializeOptions {
      source,

      ..Default::default()
    })
    .await
    .unwrap();

    let total = db.courses(None, None, None, None, None).await.unwrap();

    assert_eq!(total.len(), 314);

    let filtered = db
      .courses(None, None, None, None, Some(vec!["Winter".into()]))
      .await
      .unwrap();

    assert!(filtered.len() < total.len());

    for course in filtered {
      assert!(course
        .terms
        .iter()
        .any(|term| term.starts_with(&"Winter".to_string())));
    }
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn add_instructors() {
    let TestContext { db, .. } = TestContext::new().await;

    let instructors = vec![
      Instructor {
        name: "foo".into(),
        term: "Summer 2023".into(),
        ..Default::default()
      },
      Instructor {
        name: "bar".into(),
        term: "Summer 2023".into(),
        ..Default::default()
      },
      Instructor {
        name: "bar".into(),
        term: "Winter 2023".into(),
        ..Default::default()
      },
    ];

    for instructor in instructors {
      db.add_instructor(instructor).await.unwrap();
    }

    assert_eq!(db.instructors().await.unwrap().len(), 2);
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn search_instructor_by_name_exact() {
    let TestContext { db, db_name } = TestContext::new().await;

    let tempdir = TempDir::new(&db_name).unwrap();

    let source = tempdir.path().join("courses.json");

    fs::write(&source, get_content("search.json")).unwrap();

    db.initialize(InitializeOptions {
      source,
      ..Default::default()
    })
    .await
    .unwrap();

    assert_eq!(
      db.courses(None, None, None, None, None)
        .await
        .unwrap()
        .len(),
      123
    );

    let results = db.search("Giulia Alberini").await.unwrap();

    assert_eq!(results.instructors.len(), 1);

    assert_eq!(results.instructors.first().unwrap().name, "Giulia Alberini");
  }

  #[tokio::test(flavor = "multi_thread")]
  async fn like_and_dislike_review_flow() {
    let TestContext { db, .. } = TestContext::new().await;

    let review = Review {
      content: "foo".into(),
      course_id: "MATH240".into(),
      user_id: "1".into(),
      ..Default::default()
    };

    db.add_review(review.clone()).await.unwrap();

    assert_eq!(db.reviews().await.unwrap().len(), 1);

    db.add_like(Like {
      course_id: review.course_id.clone(),
      user_id: review.user_id.clone(),
    })
    .await
    .unwrap();

    assert_eq!(
      db.likes_for_review(&review.course_id, &review.user_id)
        .await
        .unwrap()
        .len(),
      1
    );

    assert!(db
      .add_like(Like {
        course_id: review.course_id.clone(),
        user_id: review.user_id.clone(),
      })
      .await
      .is_err());

    db.remove_like(Like {
      course_id: review.course_id.clone(),
      user_id: review.user_id.clone(),
    })
    .await
    .unwrap();

    assert_eq!(
      db.likes_for_review(&review.course_id, &review.user_id)
        .await
        .unwrap()
        .len(),
      0
    );
  }
}
