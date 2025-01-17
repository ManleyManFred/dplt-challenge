import type { EmbeddingGenerator } from "./embedding_generators";
import { type WordSimilarityScorer } from "./models";

export class VectorEmbeddingScorer implements WordSimilarityScorer {
    private dict: Map<string, Float32Array>;
    private embedding: EmbeddingGenerator;

    constructor(embedding: EmbeddingGenerator) {
        this.embedding = embedding;
        this.dict = new Map<string, Float32Array>();
    }

    generate_embedding(word: string) {
        if(this.dict.has(word)) return this.dict.get(word)!;

        const embedding = this.embedding.generate_embedding(word);
        this.dict.set(word, embedding);
        return embedding;
    }
    
    get_normalized_score(word: string): Float32Array {
        return this.generate_embedding(word);
    }

    get_normalized_comparison_score(word1: string, word2: string): number {
        const vec1 = this.get_normalized_score(word1);
        const vec2 = this.get_normalized_score(word2);

        return this.embedding.cosineSimilarity(vec1, vec2);
    }
}