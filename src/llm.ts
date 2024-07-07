import { prompt, embed } from "cross-llm";
import dotenv from "dotenv";
import type { Message } from "./interfaces";

dotenv.config();

// https://github.com/sarthakrastogi/quality-prompts/blob/main/quality_prompts/utils/llm.py#L4

export const getEmbedding = async (text: string): Promise<Array<number>> => {
  const embedding = await embed(
    text,
    "openai",
    {
      model: "text-embedding-ada-002",
    },
    {
      apiKey: process.env.openai_api_key,
    },
  );
  return embedding.data[0].embedding;
};

export const systemPrompt = async (
  messages: Array<Message>,
): Promise<string> => {
  const completion = await prompt(
    messages,
    "openai",
    {
      model: "gpt-3.5-turbo",
    },
    {
      apiKey: process.env.openai_api_key,
    },
  );
  return completion.message!;
};
