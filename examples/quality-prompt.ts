import { qualityPrompt } from "../src"

const directive = "You are given a document and your task..."
const additionalInformation = "In the knowledge graph, ..."
const outputFormatting = "You will respond with a knowledge graph in..."

const prompt = qualityPrompt(
  directive,
  additionalInformation,
  outputFormatting,
  []
)

console.log("Optimized quality prompt: ", prompt)