import { prompt } from "cross-llm"
import { tabularChainOfThoughtPrompting, qualityPrompt } from "../src"

const inputText = `Jackson is planting tulips. He can fit 6 red tulips in a row and 8 blue
tulips in a row. If Jackson buys 36 red tulips and 24 blue tulips, how
many rows of flowers will he plant?`

const directive = "Solve the given math problem"

const tabularChain = await tabularChainOfThoughtPrompting(inputText, directive, "")

const systemPrompt = qualityPrompt(tabularChain.directive, tabularChain.outputFormatting)

console.log("Optimized tabular chain of thought prompt: ", systemPrompt)

/**
 * Optimized tabular chain of thought prompt:  Solve the given math problem
      Think through the problem step by step to solve it.
      At each step, you have to figure out:
      - the step number,
      - the sub-question to be answered in that step,
      - the thought process of solving that step, and
      - the result of solving that step.
  

      Respond in the following markdown table format for each step:
      |step|subquestion|process|result|
 */

// Test the compiled prompt

const messages = [{
  role: "system",
  content: systemPrompt,
}, {
  role: "user",
  content: inputText
}]

const result = await prompt(messages, "openai", {
  model: "gpt-4-turbo"
}, {
  apiKey: process.env.openai_api_key
})

console.log("Result: ", result.message)

/**
 * Result:  To solve the problem, the steps can be broken down as follows:

| step | subquestion                                       | process                              | result                          |
|------|---------------------------------------------------|--------------------------------------|---------------------------------|
|  1   | How many rows of red tulips will Jackson plant?   | Divide the total red tulips by the number of red tulips per row: 36 red tulips ÷ 6 per row | 6 rows of red tulips  |
|  2   | How many rows of blue tulips will Jackson plant?  | Divide the total blue tulips by the number of blue tulips per row: 24 blue tulips ÷ 8 per row | 3 rows of blue tulips |
|  3   | How many rows of flowers will he plant in total?  | Add the number of red tulip rows and blue tulip rows: 6 rows of red + 3 rows of blue | 9 total rows of flowers |
 */