import { fewShot, qualityPrompt } from "../src"

type ExemplarData = Array<{
  input: string;
  label: Array<{
    entity: string;
    connections: Array<{
      entity: string;
      relationship: string;
    }>
  }>
}>

console.log("Downloading examples...")

// Initialise sample exemplars for use in few-shot prompt

const exemplars = await fetch("https://github.com/kyr0/quality-prompts-js/raw/main/examples/sample-exemplars.json");
const exemplarStore = (await exemplars.json()as ExemplarData).map(({ input, label }) => ({ input, label: JSON.stringify(label, null, 2) }));

console.log("Examples downloaded.")

// Define your prompt's components and initialise it

const directive = "You are given a document and your task is to create a knowledge graph from it."
const additionalInformation = `In the knowledge graph, entities such as people, places, objects, institutions, topics, ideas, etc. are represented as nodes.
Whereas the relationships and actions between them are represented as edges.`
const outputFormatting = `
You will respond with a knowledge graph in the given JSON format:

[
    {"entity" : "Entity_name", "connections" : [
        {"entity" : "Connected_entity_1", "relationship" : "Relationship_with_connected_entity_1},
        {"entity" : "Connected_entity_2", "relationship" : "Relationship_with_connected_entity_2},
        ]
    },
    {"entity" : "Entity_name", "connections" : [
        {"entity" : "Connected_entity_1", "relationship" : "Relationship_with_connected_entity_1},
        {"entity" : "Connected_entity_2", "relationship" : "Relationship_with_connected_entity_2},
        ]
    },
]

You must strictly respond in the given JSON format or your response will not be parsed correctly!`

const prompt = qualityPrompt(directive, outputFormatting, additionalInformation, exemplarStore)

console.log("Optimized quality prompt: ", prompt)

// Apply few-shot prompting

// This searches through your set of exemplars and uses kNN to search the most relevant exemplars to be included in context.

const inputText = "list the disorders included in cvd"
const relevantExamples = await fewShot(
  inputText,
  exemplarStore,
  2 // 2-shot 
)

for (let i=0; i<relevantExamples.length; i++) {
  console.log(`Exemplar #${i}: input: `, relevantExamples[i].input, "label: ", relevantExamples[i].label)
}

/** May print:
 * Exemplar #1: input:  Management of cardiovascular disease necessitates a multifaceted approach involving antihypertensive agents, statins to modulate dyslipidemia, and antiplatelet therapy to mitigate thrombosis risk. label:  [
  {
    "entity": "cardiovascular disease",
    "connections": [
      {
        "entity": "antihypertensive agents",
        "relationship": "involves management"
      },
      {
        "entity": "statins",
        "relationship": "modulates dyslipidemia"
      },
      {
        "entity": "antiplatelet therapy",
        "relationship": "mitigates thrombosis risk"
      }
    ]
  }
]
*/