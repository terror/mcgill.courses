#!/usr/bin/env python3

import json
import os
import uuid
from datetime import datetime
from typing import List, Set, Tuple

from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport

GRAPHQL_API_URL = "https://www.ratemyprofessors.com/graphql"
HEADERS = {"Authorization": "Basic dGVzdDp0ZXN0"}
MCGILL_SCHOOL_ID = "U2Nob29sLTE0Mzk="

transport = AIOHTTPTransport(url=GRAPHQL_API_URL, headers=HEADERS)
client = Client(transport=transport, fetch_schema_from_transport=True)

def get_professors(school_id: str) -> List[Tuple[str, str]]:
  query = gql(
    """
    query TeacherSearchResultsPageQuery(
      $query: TeacherSearchQuery!
    ) {
      search: newSearch {
        teachers(query: $query, first: 5000) {,
          edges {
            node {
              id
              firstName
              lastName
            }
          }
        }
      }
    }
    """
  )

  result = client.execute(
    query, variable_values={"query": {
      "schoolID": school_id
    }}
  )

  return [(
    edge["node"]["id"],
    f"{edge['node']['firstName']} {edge['node']['lastName']}"
  ) for edge in result["search"]["teachers"]["edges"]]

def get_professor_reviews(professor_id: str,
                          valid_courses: Set[str]) -> List[dict]:
  query = gql(
    """
    query RatingsListQuery(
      $count: Int!
      $id: ID!
      $courseFilter: String
      $cursor: String
    ) {
      node(id: $id) {
        ... on Teacher {
          firstName
          lastName
          ratings(first: $count, after: $cursor, courseFilter: $courseFilter) {
            edges {
              node {
                comment
                class
                qualityRating
                difficultyRatingRounded
                date
              }
            }
          }
        }
      }
    }
    """
  )

  result = client.execute(
    query,
    variable_values={
      "count": 10000,
      "courseFilter": None,
      "cursor": None,
      "id": professor_id,
    }
  )

  node = result["node"]
  prof_name = f"{node['firstName']} {node['lastName']}"
  reviews = [edge["node"] for edge in result["node"]["ratings"]["edges"]]

  return [
    {
      "content":
      review["comment"],
      "courseId":
      review["class"],
      "instructors": [prof_name],
      "rating":
      review["qualityRating"],
      "difficulty":
      review["difficultyRatingRounded"],
      "timestamp":
      int(
        datetime.strptime(
          " ".join(review["date"].split()[:2]), "%Y-%m-%d %H:%M:%S"
        ).timestamp()
      ),
      "userId":
      str(uuid.uuid4()),
    }
    for review in reviews
    if review["class"] in valid_courses and review["comment"] != "No Comments"
  ]

def main(seed_dir: str):
  ids, all_reviews = get_professors(MCGILL_SCHOOL_ID), []

  with open(os.path.join(seed_dir, '2023-2024.json')) as f:
    valid_courses = set([course["_id"] for course in json.loads(f.read())])

  for i, (id, prof_name) in enumerate(ids):
    print(f"({i + 1}/{len(ids)}) Scraping reviews for {prof_name}")

    try:
      all_reviews.extend(get_professor_reviews(id, valid_courses))
    except Exception as e:
      print(e)

  all_reviews = sorted(all_reviews, key=lambda x: x["courseId"])

  print(f'Scraped {len(all_reviews)} reviews')

  print('[~] Fetching all instructors...')

  instructors = set()

  for file in os.listdir(seed_dir):
    if file == "reviews.json":
      continue
    with open(os.path.join(seed_dir, file), encoding="utf-8") as f:
      for course in json.load(f):
        instructors = instructors.union(
          map(lambda x: x["name"], course["instructors"])
        )

  instructors = list(instructors)
  name_parts = [name.split() for name in instructors]

  print('[~] Building instructor map...')

  review_instructors = set(map(lambda x: x['instructors'][0], all_reviews))
  instructor_map = {}

  for instructor in review_instructors:
    if instructor in instructors:
      instructor_map[instructor] = instructor
    else:
      parts = set(instructor.split())
      best = max(name_parts, key=lambda x: len(parts.intersection(set(x))))
      instructor_map[instructor] = instructors[name_parts.index(best)] if len(
        parts.intersection(set(best))
      ) > 1 else None

  print('[~] Filtering reviews...')

  reviews = []

  for review in all_reviews:
    instructor = review['instructors'][0]
    if instructor not in instructor_map or not instructor_map[instructor]:
      continue
    review['instructors'] = [instructor_map[instructor]]
    reviews.append(review)

  print(
    f'Filtered to {len(reviews)} reviews, lost {len(all_reviews) - len(reviews)} reviews'
  )

  with open(os.path.join(seed_dir, "reviews.json"), "w") as f:
    f.write(json.dumps(reviews, ensure_ascii=False, indent=2))

if __name__ == "__main__":
  main('../../seed')
