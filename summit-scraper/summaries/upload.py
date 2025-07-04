import os
import json
import sys
from dotenv import load_dotenv
from supabase import Client, PostgrestAPIError, create_client


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
        body: str = (
            summary.get("response", {})
            .get("body", {})
            .get("output", {})[0]
            .get("content", {})[0]
            .get("text")
        )
        if not body:
            print("No body found for id: ", id)
            continue
        tags = (
            body.lower().split("**tags:**")[-1].split(",")
            if "**tags:**" in body.lower()
            else []
        )
        tags = [tag.strip() for tag in tags if tag.strip()]
        body = body.split("**Tags")[0].strip()
        try:
            supabase.from_("paper").update({"summary": body}).eq("id", id).execute()
        except PostgrestAPIError as e:
            print(f"Error updating paper with id {id}: {e}")
            continue
        if not tags:
            print(f"No tags found for id {id}, skipping tag upload.")
            continue
        try:
            tags_response = (
                supabase.from_("tag")
                .upsert([{"name": tag} for tag in tags], on_conflict="name")
                .execute()
            )
        except PostgrestAPIError as e:
            print(f"Error uploading tags for paper with id {id}: {e}")
            continue
        tag_ids = [tag["id"] for tag in tags_response.data]
        if not tag_ids:
            print(f"No tag IDs found for paper with id {id}, skipping tag association.")
            continue
        try:
            tag_paper = [{"paper_id": id, "tag_id": tag_id} for tag_id in tag_ids]
            supabase.from_("tag_paper").upsert(tag_paper).execute()
        except PostgrestAPIError as e:
            print(f"Error associating tags with paper id {id}: {e}")
            continue


if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "output.jsonl"
    if not os.path.exists(filename):
        print(f"File {filename} does not exist.")
        sys.exit(1)
    upload_summaries(filename)
    print(f"Summaries uploaded from {filename}.")
