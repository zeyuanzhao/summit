import os
import sys
import json
import time
from dotenv import load_dotenv
from supabase import Client, create_client, PostgrestAPIError


load_dotenv()

url: str | None = os.getenv("SUPABASE_URL")
key: str | None = os.getenv("SUPABASE_SERVICE_KEY")
if not url or not key:
    raise ValueError(
        "Supabase URL and Service Key must be set in environment variables."
    )
print(f"Connecting to Supabase at {url} with service key {key[:4]}...")
supabase: Client = create_client(url, key)


def upload_embeddings(filename: str, start_line: int = 1):
    with open(filename, "rb") as file:
        lines = file.read().splitlines()
    if not lines:
        print("No embeddings found in the file.")
        return

    total = len(lines)

    for idx, line in enumerate(lines, 1):
        if idx < start_line:
            continue
        embedding = json.loads(line)
        id = embedding.get("custom_id")
        if not id:
            print(f"[{idx}/{total}] No id found: {embedding}")
            continue
        vector = (
            embedding.get("response", {})
            .get("body", {})
            .get("data", {})[0]
            .get("embedding", None)
        )
        if not vector:
            print(f"[{idx}/{total}] No vector found for id: {id}")
            continue

        max_retries = 5
        for attempt in range(max_retries):
            try:
                supabase.from_("paper").update({"embedding": vector}).eq(
                    "id", id
                ).execute()
                print(f"[{idx}/{total}] Successfully updated id: {id}")
                break
            except PostgrestAPIError as e:
                wait_time = 2**attempt
                print(
                    f"[{idx}/{total}] Error updating id {id}: {e}. Retrying in {wait_time} seconds..."
                )
                time.sleep(wait_time)


if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "output.jsonl"
    start_line = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    if not os.path.exists(filename):
        print(f"File {filename} does not exist.")
        sys.exit(1)
    upload_embeddings(filename, start_line)
    print(f"Summaries uploaded from {filename}.")
