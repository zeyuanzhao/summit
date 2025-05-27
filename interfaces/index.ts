export interface PaperCardProps {
  id: string;
  title: string;
  authors?: string[];
  abstract: string;
  publishedDate?: string;
  publisher?: string;
  doi?: string;
}
