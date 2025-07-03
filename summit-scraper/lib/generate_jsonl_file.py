def generate_jsonl_file(
    variables: list[dict[str, str]],
    prompt_id: str,
    prompt_version: str | None = None,
    filename: str = "batch.jsonl",
    fields: list[str] | None = None,
):
    with open(filename, "w") as f:
        for variable in variables:
            entry = {
                "custom_id": variable["id"],
                "prompt": {
                    "id": prompt_id,
                    "version": prompt_version,
                    "variables": (
                        {k: variable[k] for k in fields} if fields else variable
                    ),
                },
            }
            f.write(f"{entry}\n")
