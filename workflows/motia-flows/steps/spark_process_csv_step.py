config = {
    "type": "event",
    "name": "spark.process.csv",
    "subscribes": ["spark.process.csv"],
    "emits": [],
    "input": {
        "type": "object",
        "properties": {
            "fileUri": {"type": "string"}
        },
        "required": ["fileUri"]
    },
    "flows": ["files-processing-flow"]
}


async def handler(input_data, context):
    file_uri = input_data["fileUri"]
    context.logger.info(f"Received file URI {file_uri} for Spark processing", {"fileUri": file_uri})
