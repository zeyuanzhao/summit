export function ErrorMessage({
  title = "Error",
  error = "An unexpected error occurred.",
}: {
  title?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-around">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
}
