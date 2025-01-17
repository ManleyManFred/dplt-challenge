import { SpellChecker } from "./spell_checker";
import { VectorEmbeddingScorer } from "./vector_embedding_scorer";
import { NaiveVectorEmbedding } from "./embedding_generators";
import { SimpleScorer } from "./simple_scorer";
import { parseArgs } from "util";
import { existsSync } from 'fs';

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    dictionary_file: {
      type: 'string',
    },
    spell_check_file: {
      type: 'string',
    },
    use_vector: {
        type: 'boolean'
    }
  },
  strict: true,
  allowPositionals: true,
});

if (!values.dictionary_file || !existsSync(`./${values.dictionary_file}`)) {
  throw Error("Please provide local path to file that exists for dictionary with --dictionary_file");
}
if (!values.spell_check_file || !existsSync(`./${values.spell_check_file}`)) {
    throw Error("Please provide local path to file for file that exists to spell check with --spell_check_file");  
}

let vector_embedding_scorer = new VectorEmbeddingScorer(new NaiveVectorEmbedding());
let simple_scorer = new SimpleScorer();

let checker: SpellChecker;

if (values.use_vector) checker = new SpellChecker(vector_embedding_scorer, 0.8);
else checker = new SpellChecker(simple_scorer, 0.8);

let dict = await checker.get_dictionary_from_file(`./${values.dictionary_file}`);

let mispelllings = await checker.get_misspellings(`./${values.spell_check_file}`, dict);

console.log('Mispelled words with suggestions:');
for(let word of mispelllings.words) {
    let suggestions = checker.get_suggestions(word, dict);
    console.log(`${word} - ${suggestions.join(', ')}`);
}

console.log('Line number context:')
for(let lc of mispelllings.lineContext) {
    console.log(lc)
}