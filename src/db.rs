use super::*;

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

    client
      .database("admin")
      .collection::<Course>("courses")
      .insert_many(
        serde_json::from_str::<Vec<Course>>(&fs::read_to_string(source)?)?
          .as_slice(),
        None,
      )
      .await?;

    log::info!("Inserted courses");

    Ok(Self { _client: client })
  }
}
