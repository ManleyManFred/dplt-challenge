export abstract class EmbeddingGenerator {
    abstract generate_embedding(word: string): Float32Array;

    dotProduct(x: Float32Array, y: Float32Array) {
        return x.reduce((sum, val, i) => sum + val * y[i], 0);
    }
    
    cosineSimilarity(x: Float32Array, y: Float32Array) {
        const xy = this.dotProduct(x, y);
        const rootxx = Math.sqrt(this.dotProduct(x, x));
        const rootyy = Math.sqrt(this.dotProduct(y, y));
        return xy / (rootxx * rootyy); 
    }

}

export class NaiveVectorEmbedding extends EmbeddingGenerator {
    generate_embedding(word: string): Float32Array {
        const embedding = new Float32Array(26);
    
        for(const char of word.toLowerCase()) {
            const code = char.charCodeAt(0) - 97;
            if (code >= 0 && code < 26) {
                embedding[code] = 1;
            }
        }
        
        const length = Math.sqrt(this.dotProduct(embedding, embedding))
        if (length > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] /= length;
            }
        }
    
        return embedding;
    }
}
