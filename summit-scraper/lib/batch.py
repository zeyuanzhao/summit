from dotenv import load_dotenv

load_dotenv()


import sys
from openai import OpenAI
import io
import json  # Added import

client = OpenAI()


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
                "method": "POST",
                "url": "/v1/responses",
                "body": {
                    "model": "gpt-4.1-mini",
                    "input": [],
                    "prompt": {
                        "id": prompt_id,
                        "version": prompt_version,
                        "variables": (
                            {k: variable[k] for k in fields} if fields else variable
                        ),
                    },
                    "store": True,
                },
            }
            f.write(json.dumps(entry) + "\n")  # Write as JSONL


def create_batch(file: io.BufferedReader, description: str | None = None):
    batch_input_file = client.files.create(
        file=file,
        purpose="batch",
    )
    batch_input_file_id = batch_input_file.id
    response = client.batches.create(
        input_file_id=batch_input_file_id,
        endpoint="/v1/responses",
        completion_window="24h",
        metadata={
            "description": (
                description if description else "Batch processing of " + file.name
            )
        },
    )
    return response


def batch_status(batch_id: str):
    response = client.batches.retrieve(batch_id)
    return response


def get_file(file_id: str):
    response = client.files.content(file_id)
    return response.text


if __name__ == "__main__":
    batch_id = sys.argv[1] if len(sys.argv) > 1 else None
    filename = sys.argv[2] if len(sys.argv) > 2 else "output.jsonl"
    if batch_id:
        status = batch_status(batch_id)
        print(f"Batch ID: {batch_id}, Status: {status.to_json()}")
        if status.status == "completed":
            if not status.output_file_id:
                print("No output file available for this batch.")
                sys.exit(1)
            file_content = get_file(status.output_file_id)
            with open(filename, "w") as f:
                f.write(file_content)
            print(f"File content saved to {filename}")
