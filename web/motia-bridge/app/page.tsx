"use client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/components/ai-elements/response";
import { DefaultChatTransport, isToolUIPart } from "ai";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { MicIcon, PaperclipIcon } from "lucide-react";

export default function Home() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  console.log(messages, status);

  return (
    <div className="font-sans min-h-[80vh] flex flex-col items-center p-6">
      <main className="w-full max-w-2xl flex flex-col gap-4 flex-1">
        <h1 className="text-xl font-semibold">Chat</h1>

        <Conversation className="rounded-lg border bg-white dark:bg-black/20">
          {messages.length === 0 ? (
            <ConversationEmptyState description="Say hi to start the chat" />
          ) : null}
          <ConversationContent>
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent>
                  <Response>
                    {m.parts
                      ?.filter((p) => p.type === "text")
                      .map((p) => (p.type === "text" ? p.text : ""))
                      .join("")}
                  </Response>
                  {m.parts?.map((p, index) => {
                    if (isToolUIPart(p)) {
                      return (
                        <Tool key={`${m.id}-tool-${index}`}>
                          <ToolHeader type={p.type} state={p.state} />
                          <ToolContent>
                            <ToolInput input={p.input} />
                            <ToolOutput
                              output={(p as any).output}
                              errorText={(p as any).errorText}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

                <PromptInput
          onSubmit={(message, e) => {
            e?.preventDefault();
            const text = (message.text ?? "").trim();
            if (!text && !(message.files && message.files.length)) return;
            void sendMessage({ text, files: message.files });
            e?.currentTarget?.reset();
          }}
        >
          <PromptInputBody>
            <PromptInputTextarea placeholder="Type a message..." />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton aria-label="Add attachment" disabled>
                <PaperclipIcon className="size-4" />
              </PromptInputButton>
              <PromptInputButton aria-label="Start voice input" disabled>
                <MicIcon className="size-4" />
                <span className="hidden sm:inline">Voice</span>
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </main>
    </div>
  );
}
