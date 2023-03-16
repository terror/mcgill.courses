use super::*;

#[derive(Debug, Clone)]
pub(crate) struct Db {
  pool: PgPool,
}

impl Db {
  pub(crate) async fn connect(config: &Config) -> Result<Self> {
    let url = format!(
      "postgres://{}:{}@localhost/{}",
      config.postgres_user, config.postgres_password, config.postgres_db
    );

    if !sqlx::Postgres::database_exists(&url).await? {
      log::debug!("Creating database...");
      Postgres::create_database(&url).await?;
    }

    let pool =
      PgPool::connect_with(sqlx::postgres::PgConnectOptions::from_str(&url)?)
        .await?;

    log::debug!("Running migrations...");

    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(Self { pool })
  }
}
