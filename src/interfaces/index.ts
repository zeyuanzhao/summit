export interface PaperCardProps {
  id: string;
  title: string;
  authors?: string[];
  abstract: string;
  publishedDate?: string;
  venue?: string;
  doi?: string;
}
