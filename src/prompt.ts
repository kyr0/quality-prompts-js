import {
  createAnalogicalPromptingSystemPrompt,
  createSelfAskSystemPrompt,
  createSimtoMCharacterExtractionSystemPrompt,
  createSimtoMSystemPrompt,
  createStepBackPromptingSystemPrompt,
  createSystem2AttentionSystemPrompt,
  createTabularChainOfThoughtPromptingSystemPrompt,
  createThreadOfThoughtPromptingSystemPrompt,
} from "./system-prompts";
import type { Exemplar, ExemplarStore } from "./interfaces";
import { systemPrompt } from "./llm";
import { getSimilarExemplarsToTestSample } from "./math";

// https://github.com/sarthakrastogi/quality-prompts/blob/main/quality_prompts/prompt.py

export const qualityPrompt = (
  directive: string,
  outputFormatting?: string,
  additionalInformation?: string,
  fewShotExamples?: Array<Exemplar>,
): string => {
  const formattedExamples = (fewShotExamples ? fewShotExamples : [])
    .map((e) => `Example input: ${e.input}\nExample output: ${e.label}\n`)
    .join("\n");

  return `${directive || ""}
        ${additionalInformation || ""}
        ${formattedExamples || ""}
        ${outputFormatting || ""}`;
};

export const fewShot = async (
  inputText: string,
  exemplarStore: ExemplarStore,
  nShots = 3,
): Promise<Array<Exemplar>> => {
  if (exemplarStore.length > nShots) {
    return getSimilarExemplarsToTestSample(inputText, exemplarStore, nShots);
  }
  return exemplarStore;
};

/**
 * Makes an LLM rewrite the prompt by removing any info unrelated to the user's question.
 * https://arxiv.org/abs/2311.11829
 */
export const system2Attention = async (
  inputText: string,
  additionalInformation: string,
): Promise<string> => {
  const messages = createSystem2AttentionSystemPrompt(
    additionalInformation,
    inputText,
  );
  return await systemPrompt(messages);
};

/**
 * Establishes the known facts
 * https://arxiv.org/abs/2311.10227
 */
export const simToM = async (
  inputText: string,
  additionalInformation: string,
): Promise<string> => {
  const characterExtractionMessages =
    createSimtoMCharacterExtractionSystemPrompt(inputText);
  const characterName = await systemPrompt(characterExtractionMessages);

  const simtoMMessages = createSimtoMSystemPrompt(
    additionalInformation,
    characterName,
  );
  return await systemPrompt(simtoMMessages);
};

/**
 * http://arxiv.org/abs/2311.04205
 */
export const rephraseAndRespond = async (
  inputText: string,
  performIn = "samePass",
): Promise<string> => {
  const rarInstruction = "Rephrase and expand the question, and respond.";
  if (performIn === "sameShot") {
    inputText += rarInstruction;
  } else if (performIn === "separateLlmCall") {
    const messages = [
      { role: "system", content: rarInstruction },
      { role: "user", content: inputText },
    ];
    inputText += await systemPrompt(messages);
  }
  return inputText;
};

/**
 * http://arxiv.org/abs/2309.06275
 */
export const rereading = (inputText: string): string => {
  return `${inputText}Read the question again:${inputText}`;
};

/**
 * Prompts the LLM to first ask any follow-up questions if needed
 * http://arxiv.org/abs/2210.03350
 */
export const selfAsk = async (
  inputText: string,
  additionalInformation: string,
  allowSearchEngine = false,
): Promise<string> => {
  const messages = createSelfAskSystemPrompt(inputText, additionalInformation);
  const response = await systemPrompt(messages);
  if (response.includes("FALSE")) {
    return additionalInformation;
  }
  const followUpQuestions: string[] = JSON.parse(response);
  for (const followUpQuestion of followUpQuestions) {
    if (allowSearchEngine) {
      // TODO: Implement search engine logic
    } else {
      const followUpMessages = [
        { role: "system", content: additionalInformation },
        { role: "user", content: followUpQuestion },
      ];
      const followUpQuestionAnswer = await systemPrompt(followUpMessages);
      additionalInformation += `Question: ${followUpQuestion}\nAnswer: ${followUpQuestionAnswer}\n`;
    }
  }
  return additionalInformation;
};

/**
 * Prompts the LLM to first generate generic questions about facts/concepts used to answer the question, before answering.
 * https://arxiv.org/pdf/2310.06117
 */
export const stepBackPrompting = async (
  inputText: string,
  additionalInformation: string,
): Promise<string> => {
  const messages = createStepBackPromptingSystemPrompt(
    inputText,
    additionalInformation,
  );
  const stepBackQuestion = await systemPrompt(messages);

  const followUpMessages = [
    { role: "system", content: additionalInformation },
    { role: "user", content: stepBackQuestion },
  ];
  const stepBackAnswer = await systemPrompt(followUpMessages);

  return `${additionalInformation}\nQuestion: ${stepBackQuestion}\nAnswer: ${stepBackAnswer}\n`;
};

/**
 * Prompts the LLM to generate three distinct questions (along with solutions) with are similar
 * to the user's query, and then finally solve the user's query.
 * https://arxiv.org/pdf/2310.01714
 */
export const analogicalPrompting = async (
  inputText: string,
  directive: string,
  outputFormatting: string,
): Promise<{ directive: string; outputFormatting: string }> => {
  const analogicalPromptingSystemPrompt = createAnalogicalPromptingSystemPrompt(
    inputText,
    directive,
    outputFormatting,
  );
  return {
    directive: analogicalPromptingSystemPrompt.updatedDirective,
    outputFormatting: analogicalPromptingSystemPrompt.updatedOutputFormatting,
  };
};

/**
 * Prompts the LLM to first analyse and summarise and additional
 * information / context step by step, before answering.
 * https://arxiv.org/pdf/2311.08734
 */
export const threadOfThoughtPrompting = async (
  additionalInformation: string,
): Promise<string> => {
  const messages = createThreadOfThoughtPromptingSystemPrompt(
    additionalInformation,
  ).contextSummarisationMessages;
  return await systemPrompt(messages);
};

/*
 * Prompts the LLM to think step by step and write the step,
 * process and result of each step in a markdown table
 * https://arxiv.org/pdf/2305.17812
 */
export const tabularChainOfThoughtPrompting = async (
  inputText: string,
  directive: string,
  outputFormatting: string,
): Promise<{ directive: string; outputFormatting: string }> => {
  const tabcotPromptingSystemPrompt =
    createTabularChainOfThoughtPromptingSystemPrompt(
      inputText,
      directive,
      outputFormatting,
    );
  return {
    directive: tabcotPromptingSystemPrompt.updatedDirective,
    outputFormatting: tabcotPromptingSystemPrompt.updatedOutputFormatting,
  };
};
