import os
import json
import sys
from dotenv import load_dotenv

from supabase import Client, create_client


load_dotenv()

url: str | None = os.getenv("SUPABASE_URL")
key: str | None = os.getenv("SUPABASE_SERVICE_KEY")
if not url or not key:
    raise ValueError(
        "Supabase URL and Service Key must be set in environment variables."
    )
print(f"Connecting to Supabase at {url} with service key {key[:4]}...")
supabase: Client = create_client(url, key)


def upload_summaries(filename: str):
    summaries = []
    with open(filename, "rb") as file:
        summaries = file.read()
    if not summaries:
        print("No summaries found in the file.")
        return

    for summary in summaries.splitlines():
        summary = json.loads(summary)
        id = summary.get("custom_id")
        if not id:
            print("No id found: ", summary.get("id"))
        body = (
            summary.get("response", {})
            .get("body", {})
            .get("output", {})[0]
            .get("content", {})[0]
            .get("text")
        )
        if not body:
            print("No body found for id: ", id)
            continue
        supabase.from_("paper").update({"summary": body}).eq("id", id).execute()


if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "output.jsonl"
    if not os.path.exists(filename):
        print(f"File {filename} does not exist.")
        sys.exit(1)
    upload_summaries(filename)
    print(f"Summaries uploaded from {filename}.")
