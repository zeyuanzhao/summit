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
}
