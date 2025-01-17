export interface WordSimilarityScorer {
    get_normalized_score(word: string): Float32Array;
    get_normalized_comparison_score(word1: string, word2: string): number;
}

export type Misspellings = {
    lineContext: Map<number, string[]>
    words: Set<string>
}