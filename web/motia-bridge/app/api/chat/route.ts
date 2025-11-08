import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages, webSearch } = (await request.json()) as {
    messages: UIMessage[];
    webSearch?: boolean;
  };

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful assistant that helps users with their questions about Motia, the AI workflow platform.${
      webSearch
        ? " You have access to web search capabilities when needed."
        : ""
    }`,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
