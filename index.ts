import { get_misspellings, get_suggestions, load_dictionary, generate_embedding } from "./dictionary";

let dict = await load_dictionary('./dictionary.txt');

let mispelllings = await get_misspellings('./test_file.txt', dict);

console.log('mispelled words:');
for(let word of mispelllings.words) {
    let suggestions = get_suggestions(word, dict);
    console.log(`${word} - ${suggestions.join(',')}`);
}

console.log('context')
for(let lc of mispelllings.lineContext) {
    console.log(lc)
}