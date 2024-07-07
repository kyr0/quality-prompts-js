import type { Message } from "./interfaces";

// https://github.com/sarthakrastogi/quality-prompts/blob/main/quality_prompts/utils/prompting_techniques_system_prompts.py

// Source: Page 4 of https://arxiv.org/pdf/2311.11829 -- only paragraph 1 of their prompt is used
export const createSystem2AttentionSystemPrompt = (
  additionalInformation: string,
  inputText: string,
): Array<Message> => {
  const systemPrompt = `Given the following text by a user, extract the part that is unbiased and not their opinion,
        so that using that text alone would be good context for providing an unbiased answer to
        the question portion of the text.
        Text sent by User:
        ${additionalInformation}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: inputText },
  ];
};

export const createSimtoMCharacterExtractionSystemPrompt = (
  inputText: string,
): Array<Message> => {
  const systemPrompt = `Which character's perspective is relevant to answer this user's question.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: inputText },
  ];
};

// Source: Page 4 of https://arxiv.org/pdf/2311.10227
export const createSimtoMSystemPrompt = (
  additionalInformation: string,
  characterName: string,
): Array<Message> => {
  const systemPrompt = `The following is a sequence of events:
        ${additionalInformation}
        Which events does ${characterName} know about?`;

  return [{ role: "system", content: systemPrompt }];
};

// Source: Written by @sarthakrastogi
export const createSelfAskSystemPrompt = (
  inputText: string,
  additionalInformation: string,
): Array<Message> => {
  const systemPrompt = `Given the below information and the user's question, decide whether follow-up questions are required to answer the question.
        Only if follow-up questions are absolutely required before answering the present questions, return the questions as a Python list:
        # Example response:
        ["follow_up_question_1", "follow_up_question_2"]

        If the user's question can be answered without follow up questions, simply respond with "FALSE".

        # Provided information:
        ${additionalInformation}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: inputText },
  ];
};

// Source: Written by @sarthakrastogi
export const createStepBackPromptingSystemPrompt = (
  inputText: string,
  additionalInformation: string,
): Message[] => {
  const systemPrompt = `Given the below information and the user's question, write a generic, high-level question about relevant concepts or facts that are required for answering the user's question.
  # Provided information:
  ${additionalInformation}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: inputText },
  ];
};

// Source: Improvised from page 5, section 5.1 of https://arxiv.org/pdf/2310.01714
export const createAnalogicalPromptingSystemPrompt = (
  inputText: string,
  directive: string,
  outputFormatting: string,
): { updatedDirective: string; updatedOutputFormatting: string } => {
  const updatedDirective = `${directive}
  When presented with a problem, recall relevant problems as examples. Afterward,
  proceed to solve the initial problem.`;

  const updatedOutputFormatting = `${outputFormatting}
  # Problem:
  ${inputText}
  # Instructions:
  ## Relevant Problems:
  Recall three examples of problems that are relevant to the initial problem. Your problems should be distinct from each other and from the initial problem. For each problem:
  - After "Q: ", describe the problem
  - After "A: ", explain the solution and provide the ultimate answer.
  ## Solve the Initial Problem:
  Q: Copy and paste the initial problem here.
  A: Explain the solution and provide the ultimate answer.
  `;

  return { updatedDirective, updatedOutputFormatting };
};

// Source: Page 4 of https://arxiv.org/pdf/2311.08734
export const createThreadOfThoughtPromptingSystemPrompt = (
  additionalInformation: string,
): { contextSummarisationMessages: Array<Message> } => {
  const systemPrompt = `${additionalInformation}
  Walk me through this context in manageable parts step by step, summarizing and analyzing as we go.`;

  return {
    contextSummarisationMessages: [{ role: "system", content: systemPrompt }],
  };
};

// Source: Written by @sarthakrastogi, output formatting taken from page 5, table 2 of https://arxiv.org/pdf/2305.17812
export const createTabularChainOfThoughtPromptingSystemPrompt = (
  inputText: string,
  directive: string,
  outputFormatting: string,
): { updatedDirective: string; updatedOutputFormatting: string } => {
  const updatedDirective = `${directive}
      Think through the problem step by step to solve it.
      At each step, you have to figure out:
      - the step number,
      - the sub-question to be answered in that step,
      - the thought process of solving that step, and
      - the result of solving that step.
  `;

  const updatedOutputFormatting = `${outputFormatting}
      Respond in the following markdown table format for each step:
      |step|subquestion|process|result|
  `;

  return { updatedDirective, updatedOutputFormatting };
};
