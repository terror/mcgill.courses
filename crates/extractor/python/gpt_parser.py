from typing import Optional
from llama_index import (
    StorageContext,
    VectorStoreIndex,
    SimpleDirectoryReader,
    ServiceContext,
    load_index_from_storage,
    set_global_service_context,
)
from llama_index.llms import OpenAI
from dotenv import load_dotenv
import openai
import os
import re

load_dotenv()
openai.api_key = os.environ["OPENAI_API_KEY"]

PROMPT = (
    "Parse the following course requirements into a `CourseReq`. "
    "Do not include `ReqNode` strings that are not course codes. "
    "The operator of a `ReqNode` cannot be null. "
    "Course codes are indicated by backticks in the input text:\n"
)


def create_index(dir: str, service_context: ServiceContext):
    documents = SimpleDirectoryReader(dir).load_data()
    index = VectorStoreIndex.from_documents(documents, service_context=service_context)
    return index


def get_index(service_context: ServiceContext):
    if not os.path.exists(os.path.join(os.getcwd(), "storage")):
        print("Index not found, building index...")
        index = create_index("llm_data", service_context)
        index.storage_context.persist()
        return index

    print("Loaded index from storage...")
    storage_context = StorageContext.from_defaults(persist_dir="./storage")
    return load_index_from_storage(storage_context, service_context=service_context)


llm = OpenAI(model="gpt-3.5-turbo", temperature=0)
service_context = ServiceContext.from_defaults(llm=llm)
set_global_service_context(service_context)
index = get_index(service_context)
query_engine = index.as_query_engine(similarity_top_k=4)


def parse_course_req(prereq: Optional[str], coreq: Optional[str]) -> str:
    if not prereq and not coreq:
        return r'{"prerequisites": null, "corequisites": null}'

    prereq = f"Prerequisite(s): {prereq}\n" if prereq else ""
    coreq = f"Corequisite(s): {coreq}" if coreq else ""

    prompt = PROMPT + prereq + coreq
    completion = query_engine.query(prompt)
    return str(completion)
