use super::*;

#[derive(
  Clone,
  Debug,
  Default,
  Deserialize,
  Eq,
  Hash,
  Ord,
  PartialEq,
  PartialOrd,
  Serialize,
)]
#[serde(rename_all = "camelCase")]
pub struct Course {
  #[serde(rename = "_id")]
  pub id: String,
  pub id_ngrams: Option<String>,
  pub title: String,
  pub title_ngrams: Option<String>,
  pub credits: String,
  pub subject: String,
  pub code: String,
  pub level: String,
  pub url: String,
  pub department: String,
  pub faculty: String,
  pub faculty_url: String,
  pub terms: Vec<String>,
  pub description: String,
  pub instructors: Vec<Instructor>,
  pub prerequisites_text: Option<String>,
  pub corequisites_text: Option<String>,
  pub prerequisites: Vec<String>,
  pub corequisites: Vec<String>,
  pub leading_to: Vec<String>,
  pub logical_prerequisites: Option<ReqNode>,
  pub logical_corequisites: Option<ReqNode>,
  pub restrictions: Option<String>,
  pub schedule: Option<Vec<Schedule>>,
}

impl Course {
  pub fn merge(self, other: Course) -> Course {
    Course {
      id: other.id,
      id_ngrams: other.id_ngrams,
      title: other.title,
      title_ngrams: other.title_ngrams,
      credits: other.credits,
      subject: other.subject,
      code: other.code,
      level: other.level,
      url: other.url,
      department: other.department,
      faculty: other.faculty,
      faculty_url: other.faculty_url,
      terms: other.terms,
      description: other.description,
      instructors: other.instructors,
      prerequisites_text: other.prerequisites_text,
      corequisites_text: other.corequisites_text,
      prerequisites: other.prerequisites,
      corequisites: other.corequisites,
      leading_to: other.leading_to,
      logical_prerequisites: other
        .logical_prerequisites
        .or(self.logical_prerequisites),
      logical_corequisites: other
        .logical_corequisites
        .or(self.logical_corequisites),
      restrictions: other.restrictions,
      schedule: other.schedule.or(self.schedule),
    }
  }
}
