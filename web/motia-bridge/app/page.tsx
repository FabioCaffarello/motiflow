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
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputActionAddAttachments,
  PromptInputSpeechButton,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputHeader,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { GlobeIcon } from "lucide-react";
import { useRef, useState } from "react";

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text?.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // If there are attachments, upload them to the test upload handler.
    if (hasAttachments) {
      try {
        const form = new FormData();

        // PromptInput provides FileUIPart objects (metadata + data-urls).
        // Convert data/blob URLs to Blobs before appending to FormData so the server
        // receives real file blobs.
        for (const f of message.files ?? []) {
          // Prefer url -> fetch -> blob for both data: and blob: URLs.
          if (f.url && typeof f.url === "string") {
            try {
              const fetched = await fetch(f.url);
              const blob = await fetched.blob();
              form.append("files", blob, f.filename || "file");
            } catch {
              // If conversion fails, fallback to sending metadata as JSON
              form.append(
                "files_meta",
                JSON.stringify({
                  filename: f.filename,
                  mediaType: f.mediaType,
                  url: f.url,
                }),
              );
            }
          } else {
            // If for some reason we don't have a url, send the object as JSON
            try {
              form.append("files_meta", JSON.stringify(f));
            } catch {
              // ignore
            }
          }
        }

        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          console.error("❌ Upload to MinIO failed:", await res.text());
        } else {
          const json = await res.json();
          console.log("✅ Upload to MinIO success:", json);

          // Store uploaded file info for the chat message
          if (json.uploadedFiles && json.uploadedFiles.length > 0) {
            // You can use this data to include MinIO URLs in the chat message later
            console.log(
              "📁 Files stored in MinIO:",
              json.uploadedFiles.map((f: { url: string }) => f.url),
            );
          }
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    const fileInfo = hasAttachments
      ? `\n\n📎 Uploaded ${message.files?.length} file(s): ${message.files
          ?.map((f) => f.filename || "unknown")
          .join(", ")}`
      : "";

    const messageText = message.text
      ? `${message.text}${fileInfo}`
      : hasAttachments
        ? `Sent with attachments${fileInfo}`
        : "";

    await sendMessage(
      {
        text: messageText,
      },
      {
        body: {
          webSearch: useWebSearch,
        },
      },
    );
  };

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
                              output={(p as { output?: unknown }).output}
                              errorText={
                                (p as { errorText?: string }).errorText
                              }
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
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Type a message..."
              ref={textareaRef}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <PromptInputSpeechButton textareaRef={textareaRef} />

              <PromptInputButton
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? "default" : "ghost"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </main>
    </div>
  );
}
