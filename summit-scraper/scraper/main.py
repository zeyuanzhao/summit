import os 
from dotenv import load_dotenv
from supabase import create_client, Client
from neurips import get_neurips_all
import csv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")
print(f"Connecting to Supabase at {url} with service key {key[:4]}...")
supabase: Client = create_client(url, key)

def upsert_papers(papers: list) -> None:
    try:
        papers_without_authors = [
            {key: value for key, value in paper.items() if key != "authors"}
            for paper in papers
        ]
        authors = list({"name": author} for paper in papers if "authors" in paper for author in paper.get("authors", []))

        try:
            res_papers = supabase.table("paper").upsert(papers_without_authors).execute()
            paper_id_map = {paper["title"]: paper["id"] for paper in res_papers.data}
        except Exception as e:
            raise Exception(f"Error upserting papers: {e}")

        try:
            res_authors = supabase.table("author").upsert(authors).execute()
            author_id_map = {author["name"]: author["id"] for author in res_authors.data}
        except Exception as e:
            raise Exception(f"Error upserting authors: {e}")

        author_paper_relationships = []
        for paper in papers:
            paper_id = paper_id_map.get(paper.get("title"))
            for author in paper.get("authors", []):
                author_id = author_id_map.get(author) 
                author_paper_relationships.append({"paper_id": paper_id, "author_id": author_id})

        try:
            res_author_paper = supabase.table("author_paper").upsert(author_paper_relationships).execute()
        except Exception as e:
            raise Exception(f"Error upserting author-paper relationships: {e}")

        print(f"Upserted {len(papers_without_authors)} papers, {len(authors)} unique authors, and {len(author_paper_relationships)} relationships successfully.")
    except Exception as e:
        print(f"Error in upsert_papers: {e}")
        
def main():
    all_papers = get_neurips_all(process=upsert_papers)
    with open("../data/neurips_papers.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=all_papers[0].keys())
        writer.writeheader()
        writer.writerows(all_papers)
        
if __name__ == "__main__":
    main()