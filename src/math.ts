import type { Exemplar, ExemplarStore } from "./interfaces";
import { getEmbedding } from "./llm";

// Cosine similarity function
export const cosineSimilarity = (
  a: Array<number>,
  b: Array<number>,
): number => {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// k-Nearest Neighbors algorithm
export const nearestNeighbors = (
  input: Array<number>,
  examples: Array<Array<number>>,
  k: number,
): number[] => {
  return (
    examples
      .map((example, index) => ({
        index,
        distance: cosineSimilarity(input, example),
      }))
      // shortest distance first
      .sort((a, b) => b.distance - a.distance)
      .slice(0, k)
      .map((item) => item.index)
  );
};

/**
 * If there are a large number of exemplars, the ones best-matching to the user's query can be actually included for few-shot prompting.
 * https://arxiv.org/abs/2101.06804
 */
// https://github.com/sarthakrastogi/quality-prompts/blob/main/quality_prompts/exemplars.py
export const getSimilarExemplarsToTestSample = async (
  inputText: string,
  exemplarStore: ExemplarStore,
  k = 3,
): Promise<Array<Exemplar>> => {
  const inputEmbedding = await getEmbedding(inputText);

  const exemplarEmbeddings: Array<Array<number>> = [];
  for (const exemplar of exemplarStore) {
    if (!exemplar.inputEmbedding) {
      exemplar.inputEmbedding = await getEmbedding(exemplar.input);
    }
    exemplarEmbeddings.push(exemplar.inputEmbedding);
  }

  // k-Nearest Neighbors of input embeddings in exemplar embeddings
  const indices = nearestNeighbors(inputEmbedding, exemplarEmbeddings, k);

  // Return the top k closest exemplars
  return indices.map((index) => exemplarStore[index]);
};
