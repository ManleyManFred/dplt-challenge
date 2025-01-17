import { createReadStream } from 'fs'
import { createInterface } from 'readline'

export type Misspellings = {
    lineContext: Map<number, string[]>
    words: Set<string>
}

export type Dictionary = {
    words: Set<string>
    embeddings: Float32Array[]
}

export function generate_embedding(word: string) {
    const embedding = new Float32Array(26);

    for(const char of word.toLowerCase()) {
        const code = char.charCodeAt(0) - 97;
        if (code >= 0 && code < 26) {
            embedding[code] = 1;
        }
    }
    
    const length = Math.sqrt(dotProduct(embedding, embedding))
    if (length > 0) {
        for (let i = 0; i < embedding.length; i++) {
            embedding[i] /= length;
        }
    }

    return embedding;
}

function dotProduct(x: Float32Array, y: Float32Array) {
    return x.reduce((sum, val, i) => sum + val * y[i], 0);
}

function cosineSimilarity(x: Float32Array, y: Float32Array) {
    const xy = dotProduct(x, y);
    const rootxx = Math.sqrt(dotProduct(x, x));
    const rootyy = Math.sqrt(dotProduct(y, y));
    return xy / (rootxx * rootyy); 
}

export async function load_dictionary(path: string) {
    const words = new Map<string, Float32Array>();

    const fileStream = createReadStream(path);

    const lines = createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of lines) {
        const word = line.trim();
        word && words.set(word, generate_embedding(word));
    }

    return words;
}

export async function get_misspellings(path: string, dict: Map<string, Float32Array>) : Promise<Misspellings> {
    const lineContext = new Map<number, string[]>();
    const misspelled_words = new Set<string>();

    const fileStream = createReadStream(path);

    const lines = createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let line_num = 0;
    for await (const line of lines) {
        const words = get_words_to_check(line);
        
        for (const word of words) {
            if(dict.has(word)) continue;

            misspelled_words.add(word);

            let wrong_words = lineContext.get(line_num) ?? [];

            lineContext.set(line_num, [...wrong_words, word]);
        }
        line_num++;
    }

    return {
        lineContext: lineContext,
        words: misspelled_words
    };
}

export function get_words_to_check(line: string) {
    return line.replace(/[^\w\s]/g, '').toLowerCase().split(/\s+/);
}

export function get_suggestions(
    word: string, 
    dict: Map<string, Float32Array>,
    cosineDistance: number = 0.8
) {
    const embedding = generate_embedding(word);

    const suggestions = new Array<{target_word: string, cosineSim: number}>();

    dict.forEach((target_embedding, target_word) => {
        const cosineSim = cosineSimilarity(target_embedding, embedding)
        cosineSim > cosineDistance && suggestions.push({target_word, cosineSim})
    });

    let trimmedSuggestions = suggestions.sort((a, b) => b.cosineSim - a.cosineSim).map(s => s.target_word);

    return trimmedSuggestions.length > 10 ? trimmedSuggestions.slice(0, 10) : trimmedSuggestions;
}