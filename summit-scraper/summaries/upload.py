import os
import json
import sys
import time
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
    with open(filename, "rb") as file:
        lines = file.read().splitlines()
    if not lines:
        print("No summaries found in the file.")
        return

    all_tags = set()    # Set of all unique tag names
    paper_tags = {}     # id -> set of tag names
    total = len(lines)

    for idx, line in enumerate(lines, 1):
        summary = json.loads(line)
        id = summary.get("custom_id")
        if not id:
            print(f"[{idx}/{total}] No id found: {summary.get('id')}")
            continue
        body = (
            summary.get("response", {})
            .get("body", {})
            .get("output", {})[0]
            .get("content", {})[0]
            .get("text")
        )
        if not body:
            print(f"[{idx}/{total}] No body found for id: {id}")
            continue
        tags = (
            body.lower().split("**tags:**")[-1].split(",")
            if "**tags:**" in body.lower()
            else []
        )
        tags = [tag.strip() for tag in tags if tag.strip()]
        body_clean = body.split("**Tags")[0].strip()

        # Individual update with retry and progressive waits
        max_retries = 5
        for attempt in range(max_retries):
            try:
                supabase.from_("paper").update({"summary": body_clean}).eq("id", id).execute()
                print(f"[{idx}/{total}] Updated paper id {id} (tags: {tags})")
                break
            except PostgrestAPIError as e:
                wait_time = 2 ** attempt
                print(f"[{idx}/{total}] Error updating paper with id {id}: {e}. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
        else:
            print(f"[{idx}/{total}] Failed to update paper with id {id} after {max_retries} attempts.")
            continue

        if tags:
            all_tags.update(tags)
            paper_tags[id] = set(tags)
        else:
            print(f"[{idx}/{total}] No tags found for id {id}, skipping tag upload.")

    # Batch upsert tags
    tag_name_to_id = {}
    if all_tags:
        try:
            print(f"Upserting {len(all_tags)} unique tags...")
            tags_response = supabase.from_("tag").upsert(
                [{"name": tag} for tag in all_tags], on_conflict="name"
            ).execute()
            if tags_response.data:
                for tag in tags_response.data:
                    tag_name_to_id[tag["name"]] = tag["id"]
            print(f"Upserted {len(tag_name_to_id)} tags.")
        except PostgrestAPIError as e:
            print(f"Error batch upserting tags: {e}")

    # Batch upsert tag-paper associations
    tag_paper = []
    for paper_id, tags in paper_tags.items():
        for tag in tags:
            tag_id = tag_name_to_id.get(tag)
            if tag_id:
                tag_paper.append({"paper_id": paper_id, "tag_id": tag_id})
            else:
                print(f"No tag ID found for tag '{tag}' (paper id {paper_id}), skipping association.")
    if tag_paper:
        try:
            print(f"Upserting {len(tag_paper)} tag-paper associations...")
            supabase.from_("tag_paper").upsert(tag_paper).execute()
            print(f"Upserted {len(tag_paper)} tag-paper associations.")
        except PostgrestAPIError as e:
            print(f"Error batch upserting tag-paper associations: {e}")


if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "output.jsonl"
    if not os.path.exists(filename):
        print(f"File {filename} does not exist.")
        sys.exit(1)
    upload_summaries(filename)
    print(f"Summaries uploaded from {filename}.")
