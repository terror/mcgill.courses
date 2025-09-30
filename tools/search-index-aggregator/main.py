import json
import os
from dataclasses import dataclass

from arrg import app, argument


@dataclass
class Course:
  _id: str
  subject: str
  title: str
  code: str


@app(description='Aggregate course data from seed files and export to JSON.')
class App:
  seed_path: str = argument(
    '-s', '--seed-path', default='seed', help='Path to the directory containing seed files.'
  )

  output_path: str = argument(
    '-o',
    '--output-path',
    default='client/src/assets/search-data.json',
    help='Path to the output JSON file.',
  )

  def run(self) -> None:
    data_paths = []

    for filename in sorted(os.listdir(self.seed_path)):
      file_path = os.path.join(self.seed_path, filename)

      if not os.path.isfile(file_path) or 'course' not in file_path:
        continue

      data_paths.append(file_path)

    unique_courses = {}
    unique_instructors = set()

    for file_path in data_paths:
      with open(file_path, 'r') as fobj:
        courses = json.load(fobj)

        for course in courses:
          unique_courses[course['_id']] = Course(
            course['_id'],
            course['subject'],
            course['title'],
            course['code'],
          )

          for instructor in course['instructors']:
            unique_instructors.add(instructor['name'])

    output = {
      'courses': [course.__dict__ for course in unique_courses.values()],
      'instructors': list(unique_instructors),
    }

    with open(self.output_path, 'w') as f:
      json.dump(output, f, separators=(',', ':'))

    print(f'Output written to {self.output_path}')


if __name__ == '__main__':
  App.from_args().run()
