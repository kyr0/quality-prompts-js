export type Message = { role: string; content: string };
export type Exemplar = {
  input: string;
  label?: string;
  inputEmbedding?: number[];
};
export type ExemplarStore = Exemplar[];
