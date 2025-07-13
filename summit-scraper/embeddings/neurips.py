import os

from dotenv import load_dotenv

load_dotenv()

from lib.get_papers import get_papers
from lib.batch import create_batch, generate_embeddings_jsonl
from supabase import Client, create_client


url: str | None = os.getenv("SUPABASE_URL")
key: str | None = os.getenv("SUPABASE_SERVICE_KEY")
if not url or not key:
    raise ValueError(
        "Supabase URL and Service Key must be set in environment variables."
    )
print(f"Connecting to Supabase at {url} with service key {key[:4]}...")
supabase: Client = create_client(url, key)


def create_neurips_embeddings_batch():
    papers = get_papers(
        supabase,
        venue="NeurIPS",
        start_date="2025-06-05",
        end_date="2025-06-07",
    )
    if not papers:
        print("No papers found.")
        return
    print("Fetched papers: ", len(papers))
    texts = [
        {
            "id": paper["id"],
            "text": f"""Title: {paper["title"]}
Tags: {[tag["name"] for tag in paper["tags"]]}
Abstract: {paper["abstract"]}
Summary: {paper["summary"]}
""",
        }
        for paper in papers
    ]
    generate_embeddings_jsonl(
        texts,
        filename="embeddings/neurips.jsonl",
        model="text-embedding-3-small",
    )
    batch = create_batch(
        file=open("embeddings/neurips.jsonl", "rb"),
        description="Embeddings for NeurIPS 23-24 papers",
        endpoint="/v1/embeddings",
    )
    print(batch.to_json())


if __name__ == "__main__":
    create_neurips_embeddings_batch()
