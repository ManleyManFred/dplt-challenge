import { type WordSimilarityScorer } from "./models";

export class SimpleScorer implements WordSimilarityScorer {
    private dict: Map<string, Float32Array>;

    constructor() {
        this.dict = new Map<string, Float32Array>();
    }
    
    get_normalized_score(word: string): Float32Array {
        if(this.dict.has(word)) return this.dict.get(word)!;

        const embedding = new Float32Array(26);
    
        for(const char of word.toLowerCase()) {
            const code = char.charCodeAt(0) - 97;
            if (code >= 0 && code < 26) {
                embedding[code] = 1;
            }
        }

        this.dict.set(word, embedding)
        return embedding;
    }

    get_normalized_comparison_score(word1: string, word2: string): number {

        if (Math.abs(word1.length - word2.length) > 4) return 0;
        const vec1 = this.get_normalized_score(word1);
        const vec2 = this.get_normalized_score(word2);
        
        if (vec1.length < vec2.length) return this.score(vec1, vec2);
        
        return this.score(vec2, vec1);
    }

    score(shortVec: Float32Array, longVec: Float32Array) {
        let score = 1;
        for(let i = 0; i < shortVec.length; i++) {
            if (shortVec[i] != longVec[i]) score -= 1 / shortVec.length;
        }
        return score;
    }
}