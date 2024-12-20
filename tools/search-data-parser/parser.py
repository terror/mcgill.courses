from dataclasses import dataclass
import json
import os
import argparse


@dataclass
class Course:
    _id: str
    subject: str
    title: str
    code: str


def main(seed_path: str, out_path: str):
    data_paths = []

    for filename in sorted(os.listdir(seed_path)):
        file_path = os.path.join(seed_path, filename)

        if not os.path.isfile(file_path) or "course" not in file_path:
            continue

        data_paths.append(file_path)

    unique_courses = {}
    unique_instructors = set()
    for file_path in data_paths:
        with open(file_path, "r") as fobj:
            courses = json.load(fobj)
            for course in courses:
                unique_courses[course["_id"]] = Course(
                    course["_id"],
                    course["subject"],
                    course["title"],
                    course["code"],
                )
                for instructor in course["instructors"]:
                    unique_instructors.add(instructor["name"])

    output = {
        "courses": [course.__dict__ for course in unique_courses.values()],
        "instructors": list(unique_instructors),
    }

    with open(out_path, "w") as f:
        json.dump(output, f, separators=(",", ":"))
    print(f"Output written to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Aggregate course data from seed files and export to JSON."
    )
    parser.add_argument(
        "--seed-path",
        type=str,
        default=os.path.join("..", "..", "seed"),
        help="Path to the directory containing seed files (default: ../../seed)",
    )
    parser.add_argument(
        "--out-path",
        type=str,
        default=os.path.join("..", "..", "client", "src", "assets", "searchData.json"),
        help="Path to the output JSON file (default: ../../client/src/assets/searchData.json)",
    )

    args = parser.parse_args()

    main(seed_path=args.seed_path, out_path=args.out_path)
