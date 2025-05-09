#[derive(Clone, Debug, Default, Eq, Hash, PartialEq)]
pub struct CourseListing {
  pub department: Option<String>,
  pub faculty: Option<String>,
  pub level: Option<String>,
  pub terms: Vec<String>,
  pub url: String,
}
