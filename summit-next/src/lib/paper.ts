export function urlForPaper(canonicalId: string): string {
  const parsedId = canonicalId.toLowerCase();
  if (parsedId.startsWith("neurips")) {
    const [, year, id] = parsedId.split(".");
    return `https://proceedings.neurips.cc/paper_files/paper/${year}/hash/${id}-Abstract-Conference.html`;
  }
  return `https://doi.org/${parsedId}`;
}
