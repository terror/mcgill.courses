use super::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct Instructor {
  pub(crate) name: String,
  pub(crate) term: String,
}
