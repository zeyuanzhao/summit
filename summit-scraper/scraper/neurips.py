import requests
from bs4 import BeautifulSoup

YEARS = ["2024", "2023"]
PROCEEDINGS_BASE_URL = "https://proceedings.neurips.cc/paper_files/paper"
PAPER_BASE_URL = "https://proceedings.neurips.cc"

def get_neurips_paper(paper_url: str, year: str) -> dict:
    paper_res = requests.get(f"{PAPER_BASE_URL}{paper_url}", timeout=10)
    if paper_res.status_code != 200:
        raise ValueError(f"Failed to fetch paper {paper_url} for NeurIPS {year}")
    paper_soup = BeautifulSoup(paper_res.text, "html.parser")

    title = paper_soup.find("h4").text.strip()
    authors = paper_soup.find("h4", text="Authors").find_next("p").text.strip()
    abstract = paper_soup.find("h4", text="Abstract").find_next("p").text.strip()
    hash = paper_url.split("/hash/")[-1].split("-")[0]

    paper = {
        "title": title,
        "authors": authors.split(", "),
        "abstract": abstract,
        "published_date": f"{year}-12-01",
        "url": f"{PAPER_BASE_URL}{paper_url}",
        "venue": "NeurIPS",
        "canonical_id": f"neurips.{year}.{hash}",
    }

    return paper

def get_neurips_year(year: str, process = None) -> list:
    url = f"{PROCEEDINGS_BASE_URL}/{year}"
    res = requests.get(url, timeout=10)
    if res.status_code != 200:
        raise ValueError(f"Failed to fetch data for NeurIPS {year}")

    soup = BeautifulSoup(res.text, "html.parser")
    papers = []
    for i, link in enumerate(soup.find_all("a", title="paper title")):
        paper_url = link.get("href")
        if not paper_url:
            continue
        try:
            paper = get_neurips_paper(paper_url, year)
            if paper:
                papers.append(paper)
                print(f"{i}: {year} - {paper['title']}")
                if process and len(papers) % 20 == 0:
                    process(papers[-20:])
        except ValueError as e:
            print(e)
    return papers

def get_neurips_all(process = None) -> list:
    all_papers = []
    for year in YEARS:
        papers = get_neurips_year(year, process)
        all_papers.extend(papers)
    return all_papers

if __name__ == "__main__":
    def dummy_process(batch):
        print(f"Processing batch of {len(batch)} papers")

    all_papers = get_neurips_all(dummy_process)
    print(f"Total papers fetched: {len(all_papers)}")
