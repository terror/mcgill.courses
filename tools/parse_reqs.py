from typing import Optional, Any
from llama_index import (
    StorageContext,
    VectorStoreIndex,
    SimpleDirectoryReader,
    ServiceContext,
    load_index_from_storage,
    set_global_service_context,
)
from llama_index.indices.query.base import BaseQueryEngine
from llama_index.llms import OpenAI
from dotenv import load_dotenv
from argparse import ArgumentParser
import openai
import os
import re
import json

PROMPT = ("Parse the following course requirements into a `CourseReq`. "
          "Do not include `ReqNode` strings that are not course codes. "
          "The operator of a `ReqNode` cannot be null. "
          "Course codes are indicated by backticks in the input text:\n")
COURSE_CODE_PATTERN = re.compile(
    "([A-Z0-9]){4} [0-9]{3}(D1|D2|N1|N2|J1|J2|J3)?")


def create_index(dir: str, service_context: ServiceContext):
    documents = SimpleDirectoryReader(dir).load_data()
    index = VectorStoreIndex.from_documents(documents,
                                            service_context=service_context)
    return index


def get_index(service_context: ServiceContext):
    if not os.path.exists(os.path.join(os.getcwd(), "storage")):
        print("Index not found, building index...")
        index = create_index("llm_data", service_context)
        index.storage_context.persist()
        return index

    print("Loaded index from storage...")
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    return load_index_from_storage(storage_context,
                                   service_context=service_context)


def parse_course_req(query_engine: BaseQueryEngine, prereq: Optional[str],
                     coreq: Optional[str]) -> str:
    if not prereq and not coreq:
        return r'{"prerequisites": null, "corequisites": null}'

    prereq = f"Prerequisite(s): {prereq}\n" if prereq else ""
    coreq = f"Corequisite(s): {coreq}" if coreq else ""

    prompt = PROMPT + prereq + coreq
    completion = query_engine.query(prompt)
    return str(completion)


def postprocess(req: str | dict[str, Any]) -> Optional[str | dict[str, Any]]:
    match req:
        case str():
            COURSE_CODE_PATTERN.fullmatch(req)
        case dict():
            assert len(req.keys()) == 2
            assert "operator" in req and "groups" in req

            flattened = list(filter(None, map(postprocess, req["groups"])))

            match len(flattened):
                case 0:
                    return None
                case 1:
                    return postprocess(flattened[0])
                case _:
                    return {**req, "groups": flattened}


def init_argparse() -> ArgumentParser:
    parser = ArgumentParser(
        description="Parse logical course requirements from existing data.", )

    parser.add_argument("file",
                        type=str,
                        help="The path to the course JSON file.")
    parser.add_argument(
        "-d",
        "--delay",
        type=int,
        default=1000,
        help="The delay between requests in milliseconds.",
    )
    parser.add_argument(
        "-o",
        "--overwrite",
        action="store_true",
        help=
        "Reparse all courses, even if they already have parsed requirements.",
    )

    return parser


def main():
    load_dotenv()
    openai.api_key = os.environ["OPENAI_API_KEY"]

    llm = OpenAI(model="gpt-3.5-turbo", temperature=0)
    service_context = ServiceContext.from_defaults(llm=llm)
    set_global_service_context(service_context)
    index = get_index(service_context)
    query_engine = index.as_query_engine(similarity_top_k=4)

    print("Initialized query engine.")

    args = init_argparse().parse_args()

    with open(args.file, "r") as f:
        courses = json.load(f)

    num_courses = len(courses)

    failed = []

    for i, course in enumerate(courses):
        already_parsed = (course["logical_prerequisites"]
                          or course["logical_corequisites"])

        if not args.overwrite and already_parsed:
            continue

        progress = f"({i + 1}/{num_courses})"

        prereq = course["prerequisites"]
        coreq = course["corequisites"]
        course_code = course["_id"]

        if not prereq and not coreq:
            print(
                f"{progress} {course_code} does not have any requirements, skipping..."
            )
            continue

        print(f"{progress} Parsing requirements {course_code}...")

        prereq_str = course["prerequisites_text"]
        coreq_str = course["corequisites_text"]
        completion = parse_course_req(query_engine, prereq_str, coreq_str)

        print("Got completion:", completion)
        course_req = json.loads(completion)

        prereqs = course_req["prerequisites"]
        coreqs = course_req["corequisites"]

        try:
            prereqs = postprocess(prereqs) if prereqs else None
            coreqs = postprocess(coreqs) if coreqs else None
        except AssertionError:
            print("Failed to parse requirements, skipping...")
            failed.append(course_code)
            continue

        course["logical_prerequisites"] = prereqs
        course["logical_corequisites"] = coreqs


if __name__ == "__main__":
    main()
