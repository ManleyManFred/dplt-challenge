import { SpellChecker } from "./spell_checker";
import { VectorEmbeddingScorer } from "./vector_embedding_scorer";
import { NaiveVectorEmbedding } from "./embedding_generators";

const checker = new SpellChecker(new VectorEmbeddingScorer(new NaiveVectorEmbedding()));

let dict = await checker.get_dictionary_from_file('./dictionary.txt');

let mispelllings = await checker.get_misspellings('./test_file.txt', dict);

console.log('mispelled words:');
for(let word of mispelllings.words) {
    let suggestions = checker.get_suggestions(word, dict);
    console.log(`${word} - ${suggestions.join(',')}`);
}

console.log('context')
for(let lc of mispelllings.lineContext) {
    console.log(lc)
}