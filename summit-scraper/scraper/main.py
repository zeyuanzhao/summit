import csv
import os

from dotenv import load_dotenv
from neurips import get_neurips_all
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


def upsert_papers(papers: list) -> None:
    try:
        papers_without_authors = [
            {key: value for key, value in paper.items() if key != "authors"}
            for paper in papers
        ]
        authors = list(
            {"name": author}
            for paper in papers
            if "authors" in paper
            for author in paper.get("authors", [])
        )

        # Deduplicate authors by name
        unique_authors = list({author["name"]: author for author in authors}.values())

        paper_id_map = {}
        try:
            res_papers = (
                supabase.table("paper").upsert(papers_without_authors, on_conflict="canonical_id").execute()
            )
            paper_id_map = {paper["title"]: paper["id"] for paper in res_papers.data}
        except PostgrestAPIError as e:
            print(f"Error upserting papers: {e}")
            print("Retrying upsert individually")
            for paper in papers_without_authors:
                try:
                    res_paper = supabase.table("paper").upsert(paper, on_conflict="canonical_id").execute()
                    if res_paper.data:
                        paper_id_map[paper["title"]] = res_paper.data[0]["id"]
                except PostgrestAPIError as e:
                    res_paper_select = supabase.table("paper").select("id").eq("canonical_id", paper["canonical_id"]).execute()
                    paper_id_map[paper["title"]] = res_paper_select.data[0]["id"] if res_paper_select.data else None
                    if not paper_id_map[paper["title"]]:
                        print(f"Paper {paper['title']} not found in database, skipping.")
                    print(f"Error upserting paper {paper['title']}: {e}")

        author_id_map = {}
        try:
            res_authors = supabase.table("author").upsert(unique_authors, on_conflict="name").execute()
            author_id_map = {
                author["name"]: author["id"] for author in res_authors.data
            }
        except PostgrestAPIError as e:
            print(f"Error upserting authors: {e}")
            print("Retrying upsert individually")
            for author in unique_authors:
                try:
                    res_author = supabase.table("author").upsert(author, on_conflict="name").execute()
                    if res_author.data:
                        author_id_map[author["name"]] = res_author.data[0]["id"]
                except PostgrestAPIError as e:
                    res_author_select = supabase.table("author").select("id").eq("name", author["name"]).execute()
                    author_id_map[author["name"]] = res_author_select.data[0]["id"] if res_author_select.data else None
                    if not author_id_map[author["name"]]:
                        print(f"Author {author['name']} not found in database, skipping.")
                    print(f"Error upserting author {author['name']}: {e}")

        author_paper_relationships = []
        for paper in papers:
            paper_id = paper_id_map.get(paper.get("title"))
            for author in paper.get("authors", []):
                author_id = author_id_map.get(author)
                author_paper_relationships.append(
                    {"paper_id": paper_id, "author_id": author_id}
                )

        try:
            (
                supabase.table("author_paper")
                .upsert(author_paper_relationships, on_conflict="paper_id,author_id")
                .execute()
            )
        except PostgrestAPIError as e:
            print(f"Error upserting author-paper relationships: {e}")
            print("Retrying upsert individually")
            for relationship in author_paper_relationships:
                try:
                    supabase.table("author_paper").upsert(relationship, on_conflict="paper_id,author_id").execute()
                except PostgrestAPIError as e:
                    print(f"Error upserting relationship {relationship}: {e}")

        print(
            f"Upserted {len(paper_id_map)} papers, {len(author_id_map)} unique authors, and {len(author_paper_relationships)} relationships successfully."
        )
    except Exception as e:
        print(f"Unexpected error in upsert_papers: {e}")


def main():
    all_papers = get_neurips_all(process=upsert_papers)
    with open("../data/neurips_papers.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=all_papers[0].keys())
        writer.writeheader()
        writer.writerows(all_papers)


if __name__ == "__main__":
    main()
