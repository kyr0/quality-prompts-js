<span align="center">

  # QualityPrompts

  ### Write Quality Prompts - TypeScript/JavaScript edition

  <font color="#555">
  
  #### Use and evaluate prompting techniques quickly

  </font>

</span>

> 🔬 QualityPrompts implements 58 prompting techniques explained in [this survey from OpenAI, Microsoft, et al.](https://arxiv.org/pdf/2406.06608). Original Python implementation by [Sarthak Rastogi](https://github.com/sarthakrastogi/quality-prompts).

## 📚 Usage

### 1. Install Quality Prompts:

`npm/yarn/bun install quality-prompts-js`

_**Please note:** For all examples to work well, copy `env.example` to `.env` and set the `openai_api_key=OPEN_API_KEY` environment variable._

### 2. Write the components of your prompt:

Example: [`quality-prompt.ts`](./examples/quality-prompt.ts)
Run: `npm run example quality-prompt.ts`

```ts
import { qualityPrompt } from "quality-prompts-js"

const directive = "You are given a document and your task..."
const additionalInformation = "In the knowledge graph, ..."
const outputFormatting = "You will respond with a knowledge graph in..."

const prompt = qualityPrompt(
  directive,
  additionalInformation,
  outputFormatting,
  []
)
```

### 3. QualityPrompts searches and uses only the few-shot examples that are relevant to the user's query

Example: [`few-shot.ts`](./examples/few-shot.ts)
Run: `npm run example few-shot.ts`


```ts
import { fewShot } from "quality-prompts-js"

// see ./examples/few-shot.ts for a fully working example
const relevantExamples = await fewShot(
 "list the disorders included in cvd",
  [...],
  2 // 2-shot 
)
```

### 4. Simply call one of several prompting techniques to your prompt

##### System2Attention
Helps clarify the given context as an additinoal step before it's used to answer the question

Example: [`system2attention.ts`](./examples/system2attention.ts)
Run: `npm run example system2attention.ts`

```ts
import { system2Attention } from "quality-prompts-js"

const inputText = "list the disorders included in cvd"
const userContextInformation = "Problem with heart rate."

const attentionOptimizedPrompt = await system2Attention(inputText, userContextInformation)

console.log("Optimized attention prompt: ", attentionOptimizedPrompt)
```

```
>> You are given a document and your task is to create a knowledge graph from it.
        
In the knowledge graph, entities such as people, places, objects, institutions, topics, ideas, etc. are represented as nodes.
Whereas the relationships and actions between them are represented as edges.

Example input: Cardiovascular disease (CVD) encompasses a spectrum of...
Example output: [{'entity': 'cardiovascular disease (cvd)', 'connections': ...

You will respond with a knowledge graph in the given JSON format:

[
    {"entity" : "Entity_name", "connections" : [
        {"entity" : "Connected_entity_1", "relationship" : "Relationship_with_connected_entity_1},
        {"entity" : "Connected_entity_2", "relationship" : "Relationship_with_connected_entity_2},
        ]
    },
]
```

#### Tabular Chain of Thought Prompting
Prompts the LLM to think step by step and write the step, process and result of each step in a markdown table.
Significantly boosts accuracy in solving math problems.

Example: [`tabular-chain-of-thought.ts`](./examples/tabular-chain-of-thought.ts)
Run: `npm run example tabular-chain-of-thought.ts`

```ts
import { tabularChainOfThoughtPrompting, qualityPrompt } from "quality-prompts-js"

const inputText = `Jackson is planting tulips. He can fit 6 red tulips in a row and 8 blue
tulips in a row. If Jackson buys 36 red tulips and 24 blue tulips, how
many rows of flowers will he plant?`

const directive = "Solve the given math problem"

const tabularChain = await tabularChainOfThoughtPrompting(inputText, directive, "")

const systemPrompt = qualityPrompt(tabularChain.directive, tabularChain.outputFormatting)

console.log("Optimized tabular chain of thought prompt: ", systemPrompt)
```

```
Solve the given math problem.
Think through the problem step by step to solve it.
At each step, you have to figure out:
- the step number,
- the sub-question to be answered in that step,
- the thought process of solving that step, and
- the result of solving that step.
Respond in the following markdown table format for each step:
|step|subquestion|process|result|    
```

### 6. Upcoming: Easily evaluate different prompting techniques

