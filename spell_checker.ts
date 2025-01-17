import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import type { Misspellings, WordSimilarityScorer } from './models'

export class SpellChecker {
    private scorer: WordSimilarityScorer;
    private min_score: number;
    private max_suggestions: number;

    constructor(
        scorer: WordSimilarityScorer, 
        min_score: number = 0.8, 
        max_suggestions: number = 10) {
        this.scorer = scorer;
        this.min_score = min_score;
        this.max_suggestions = max_suggestions;
    }

    async get_dictionary_from_file(path: string) {
        const words = new Map<string, Float32Array>();

        const fileStream = createReadStream(path);

        const lines = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of lines) {
            const word = line.trim();
            word && words.set(word, this.scorer.get_normalized_score(word));
        }

        return words;
    }

    async get_misspellings(path: string, dict: Map<string, Float32Array>) : Promise<Misspellings> {
        const lineContext = new Map<number, string[]>();
        const misspelled_words = new Set<string>();

        const fileStream = createReadStream(path);

        const lines = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let line_num = 0;
        for await (const line of lines) {
            const words = this.get_words_to_check(line);
            
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
    
    get_words_to_check(line: string) {
        return line.replace(/[^\w\s]/g, '').toLowerCase().split(/\s+/);
    }

    get_suggestions(
        word: string, 
        dict: Map<string, Float32Array>
    ) {
        const embedding = this.scorer.get_normalized_score(word);

        const suggestions = new Array<{target_word: string, score: number}>();

        dict.forEach((target_embedding, target_word) => {
            const score = this.scorer.get_normalized_comparison_score(word, target_word);
            score > this.min_score && suggestions.push({target_word, score})
        });

        let trimmedSuggestions = suggestions.sort((a, b) => b.score - a.score).map(s => s.target_word);

        return trimmedSuggestions.length > this.max_suggestions ? trimmedSuggestions.slice(0, this.max_suggestions) : trimmedSuggestions;
    }
}