use super::*;

lazy_static! {
  static ref STOP_WORDS: HashSet<String> =
    HashSet::from_iter(stop_words::get("en"));
}

pub(crate) trait StrExt {
  fn filter_stopwords(self) -> String;
  fn ngrams(self) -> String;
}

impl StrExt for &str {
  fn filter_stopwords(self) -> String {
    self
      .split(' ')
      .filter(|w| !STOP_WORDS.contains(*w))
      .join(" ")
  }

  fn ngrams(self) -> String {
    self
      .split(' ')
      .map(|word| {
        (3..=word.len())
          .map(|x| word.get(..x).unwrap_or(word))
          .join(" ")
      })
      .join(" ")
  }
}

#[test]
fn ngram_single_word_test() {
  assert_eq!(
    "MATH240".ngrams(),
    String::from("MAT MATH MATH2 MATH24 MATH240")
  )
}

#[test]
fn ngram_multi_word_test() {
  assert_eq!(
      "Discrete Structures".ngrams(),
      String::from("Dis Disc Discr Discre Discret Discrete Str Stru Struc Struct Structu Structur Structure Structures")
    )
}

#[test]
fn stop_word_filter_test() {
  assert_eq!(
    "Algorithms and Data Structures".filter_stopwords(),
    String::from("Algorithms Data Structures")
  )
}