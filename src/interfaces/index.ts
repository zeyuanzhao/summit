export interface PaperCardProps {
  id: string;
  title: string;
  authors?: string[];
  abstract: string;
  publishedDate?: string;
  venue?: string;
  doi?: string;
}

export interface FeedStore {
  feed: PaperCardProps[];
  currentPage: number;
  setFeed: (newFeed: PaperCardProps[]) => void;
  addToFeed: (newPapers: PaperCardProps[]) => void;
  setCurrentPage: (page: number) => void;
  incrementPage: () => void;
  decrementPage: () => void;
}
