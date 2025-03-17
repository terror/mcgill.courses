import ast
import json
import os
import re
import time
from typing import Any, Optional

from arrg import app, argument
from bs4 import BeautifulSoup, Tag
from dotenv import load_dotenv
from openai import OpenAI

PROMPT = "Given a list of course requirements, parse it into a logic expression tree structure. Each node is represented by an string or array. Non-leaf nodes are arrays, and represent nodes for logical operators. The first element in the array is a logical operator (AND represented by '&', OR being represented by '|'), the rest of the elements in the array are the children. Logical expressions should only ever be in the first element of the array. Leaf nodes are strings, never arrays. Leaf node values are the course codes in the requirements. These are only allowed to be valid course codes, not any arbitrary string. A valid course code is 4 uppercase/numeric characters followed by a space, then a 3 digit number, and optionally 2 uppercase/numeric characters. Use single quotes for strings."

COURSE_CODE_PATTERN = re.compile('([A-Z0-9]){4} [0-9]{3}(D1|D2|N1|N2|J1|J2|J3)?')

ListReqNode = str | list['ListReqNode']
JsonReqNode = str | dict[str, Any]


def get_requisite_completion(client: OpenAI, req: str) -> ListReqNode:
  model_name = os.environ.get('FINETUNE_MODEL_NAME')

  if model_name is None:
    raise EnvironmentError('Finetune model name not present in environment variables.')

  completion = client.chat.completions.create(
    model=model_name,
    messages=[
      {'role': 'system', 'content': PROMPT},
      {'role': 'user', 'content': req},
    ],
    temperature=0,
  )

  prediction = completion.choices[0].message.content

  if prediction is None:
    raise ValueError('GPT gave none for message content')

  prediction = prediction.replace('\n', '')

  print('Got completion: ', prediction)

  return ast.literal_eval(prediction)


def postprocess(list_req: ListReqNode) -> Optional[JsonReqNode]:
  match list_req:
    case str():
      return list_req if COURSE_CODE_PATTERN.fullmatch(list_req) else None
    case list():
      if list_req[0] == '&':
        op = 'AND'
      elif list_req[0] == '|':
        op = 'OR'
      else:
        raise ValueError("First operator in requisite should be '&' or '|'")

      flattened = list(filter(None, map(postprocess, list_req[1:])))

      match len(flattened):
        case 0:
          return None
        case 1:
          return flattened[0]
        case _:
          return {'operator': op, 'groups': flattened}


def parse_course_req(client: OpenAI, req: Optional[str]) -> Optional[str | dict[str, Any]]:
  if req is None:
    return None

  if ':' in req:
    _, right = req.split(': ', maxsplit=1)

    if COURSE_CODE_PATTERN.fullmatch(right) is not None:
      return right

  return postprocess(get_requisite_completion(client, req))


def preprocess_html(html: str) -> str:
  parsed = BeautifulSoup(f'<div>{html}</div>', 'html.parser')

  root = parsed.find('div')
  assert isinstance(root, Tag)

  result = ''

  for child in root.children:
    match child:
      case Tag(name='a'):
        course_code = child.attrs['href'].split('/')[-1].upper().replace('-', ' ')
        result += f'{course_code}'
      case _:
        result += child.text

  return result


@app(description='Parse logical course requirements from existing data')
class App:
  file: str = argument(help='The path to the course JSON file.')

  delay: int = argument(
    '-d', '--delay', default=1000, help='The delay between requests in milliseconds.'
  )

  overwrite: bool = argument(
    '-o', '--overwrite', help='Reparse all courses, even if they already have parsed requirements.'
  )

  def run(self) -> None:
    load_dotenv()

    client = OpenAI()

    with open(self.file, 'r') as f:
      courses = json.load(f)

    num_courses = len(courses)

    failed = []

    if os.path.exists('failed.txt'):
      with open('failed.txt', 'r') as ff:
        failed = [s.strip() for s in ff.readlines()]

    for i, course in enumerate(courses):
      course_code = ''

      try:
        already_parsed = course['logicalPrerequisites'] or course['logicalCorequisites']

        if not self.overwrite and already_parsed:
          continue

        progress = f'({i + 1}/{num_courses})'
        prereq = course['prerequisites']
        coreq = course['corequisites']
        course_code = course['_id']

        if course_code in failed:
          print(f'{progress} {course_code} failed previously, skipping...')
          continue

        if not prereq and not coreq:
          print(f'{progress} {course_code} does not have any requirements, skipping...')
          continue

        print(f'{progress} Parsing requirements {course_code}...')

        prereqs, coreqs = None, None

        if prereq:
          prereq_str = preprocess_html(course['prerequisitesText'])
          prereqs = parse_course_req(client, prereq_str)
        if coreq:
          coreq_str = preprocess_html(course['corequisitesText'])
          coreqs = parse_course_req(client, coreq_str)

        print('---Postprocessed---')
        print('Prerequisites:', prereqs)
        print('Corequisites:', coreqs)
        print()

        course['logicalPrerequisites'] = prereqs
        course['logicalCorequisites'] = coreqs
        time.sleep(self.delay / 1000)
      except KeyboardInterrupt:
        print('Detected keyboard interrupt, saving progress...')
        break
      except Exception as e:
        print('Failed to parse requirements, skipping...')
        print(f'Error: {str(e)}')
        failed.append(course_code)
        continue

    with open(self.file, 'w') as f:
      json.dump(courses, f, indent=2)

    print(f'Failed to parse the following course(s): {", ".join(failed)}')

    with open('failed.txt', 'w') as f:
      f.write('\n'.join(failed))


if __name__ == '__main__':
  App.from_args().run()
