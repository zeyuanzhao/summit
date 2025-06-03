export async function getRecommendations(userId?: string, limit: number = 10) {
  const TEMP_RECS = [
    "f0cb5eaa-e399-4c95-aad6-c2b08e472538",
    "d234b4ed-9ab5-4017-a840-60f089868dd5",
  ];

  return TEMP_RECS.slice(0, limit);
}
