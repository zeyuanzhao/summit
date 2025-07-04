import os

from dotenv import load_dotenv

load_dotenv()

from lib.get_papers import get_papers
from lib.batch import generate_jsonl_file, create_batch
from supabase import Client, create_client


url: str | None = os.getenv("SUPABASE_URL")
key: str | None = os.getenv("SUPABASE_SERVICE_KEY")
if not url or not key:
    raise ValueError(
        "Supabase URL and Service Key must be set in environment variables."
    )
print(f"Connecting to Supabase at {url} with service key {key[:4]}...")
supabase: Client = create_client(url, key)


def create_neurips_batch():
    papers = get_papers(
        supabase,
        venue="NeurIPS",
        start_date="2025-06-05",
        end_date="2025-06-07",
        amount=20,
    )
    if not papers:
        print("No papers found.")
        return
    print("Fetched papers: ", len(papers))
    generate_jsonl_file(
        variables=papers,
        prompt_id="pmpt_6865fea7a73481979d2a20d7492a8b990e375d240959c724",
        filename="summaries/neurips.jsonl",
        fields=["title", "abstract", "venue", "published_date"],
    )
    batch = create_batch(
        file=open("summaries/neurips.jsonl", "rb"),
        description="Summaries for NeurIPS 23-24 papers",
    )
    print(batch.to_json())


if __name__ == "__main__":
    create_neurips_batch()
