import { system2Attention } from "../src"

const inputText = "list the disorders included in cvd"
const userContextInformation = "Problem with heart rate."

const attentionOptimizedPrompt = await system2Attention(inputText, userContextInformation)

console.log("Optimized attention prompt: ", attentionOptimizedPrompt)