
def get_papers(supabase, venue: str | None = None, start_date: str | None = None, end_date: str | None = None, offset: int = 0, limit: int = 1000, amount: int | None = None) -> list:

    query = supabase.from_("paper").select("*")

    if venue:
        query = query.eq("venue", venue)
    if start_date:
        query = query.gte("created_at", start_date)
    if end_date:
        query = query.lte("created_at", end_date)
        
    papers = []
    
    try:
        while amount > 0 if amount is not None else True:
            response = query.range(offset, offset + min(limit, amount or limit) - 1).execute()
            data = getattr(response, "data", None)
            if data is None:
                print("Error fetching papers: No data returned from Supabase.")
                return papers
            if len(data) == 0:
                print("No more papers found.")
                break
            papers.extend(data)
            if amount is not None:
                amount -= len(data)
            offset += limit
            print(f"Fetched {len(data)} papers, total fetched: {len(papers)}")
        return papers
    except Exception as e:
        print(f"Error fetching papers: {e}")
        return papers