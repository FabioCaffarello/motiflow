import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(request: Request) {
    const { messages } = (await request.json()) as { messages: UIMessage[] };

    const result = await streamText({
        model: openai("gpt-4.1"),
        system: "You are a helpful assistant that helps users with their questions about Motia, the AI workflow platform.",
        messages: convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse();
}