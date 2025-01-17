# Learning new things for fun...

## TLDR

Instructions for running are at the bottom of this file.

I spent about 2 hours figuring out how to run the vector embeddings version in the first commit. I spent another 30 min or so refactoring into something semi-close to what I'd build if I were coding for a real world application - i.e. the ability to swap out comparison algorithms and vector embedding algorithms (second commit)

My output is in the console. The mis spelled words are output with the "context" of the line number they are on for easy post-processing/user notification. The suggested words are printed next to the misspelled word, sorted by "proximity." The proximity algorithm is a faster/much simpler algorithm I wrote pretty quickly at the end as I wanted to spend much of my time on the vector embedding implementation.

Overall I probably spent more than 4 hours but much of that time was debugging/learning about how to use vector embeddings in a context like this.

You can run the vector embedding version by providing the flag as shown below in the bun instructions.

## General

You'll see I have left my original code that's somewhat overly complex for the challenge (custom vector embeddings with cosine similarities) and abstracted it away so it's easy for you to try it if you're interested. It's arguably worse of a spellchecker than my simple scorer, which took about 10 min to write. I spent the vast majority of my 4 hours playing with different vector embedding calculation approaches that felt like something I could implement on my own.

I try to use these challenges to work on something I've wanted to anyway. This keeps me motivated to complete the challenge despite my busy work schedule and also lessens the blow if you guys decide it sucks. At least I learned something and played with a concept I had wanted to but never had an excuse. 

Although the application didn't necessary make the MOST sense - and in hindsight and for reasons that are clear to me know but were less clear before I started - I wanted to play with vector embeddings. Initially I was going to just use a library and upload those embeddings to a vector DB - because this is something I've wanted to do for a while for my own hobby project (create a RAG app). However I decided that the actual implementation of a simple vector cosine algorithm and embedding didn't sound very hard so I'd do it myself to learn how that works.

## Why Vector embeddings

Cause they're all the rage in AI/LLM applications? I've never actually written a program that does anything with them so I went in thinking about a vector embedding as essentially just a numerical value for the character in a string and put into 1-D array (vector). I reasoned this should work well because surely the cosine between something like w-a-s and w-s-s was close. It became clear it wasn't (obvious in hindsight). I then researched how these things are actually implemented and it turns out it's with word frequencies, so I took a stab at implementing that and the results were a little better. But I kept getting snagged on why "wss" wouldn't recommend "was." At one point I even went so far as to map my own keyboard array...

It took me a while to realize the order doesn't actually matter and that's the problem. And that vector embeddings work really well with SENTENCES because the additional data acts as context. Because we're working with just words here, the cosine similarity is not as close as I thought intuitively.

That said I'm pretty happy with the output from my example file.

## Why simple in the end

Because simpler is better if the results are the same. And the results are very similar.

## Why I skipped proper nouns

This seemed like something I could get tripped up on easily and end up spending a lot of time on without much to show for it. While it would be easy to pull out proper nouns that didn't start a sentence and ignore those, it would be much harder (I thought) to do so for proper nouns that start a sentence.

After thinking about it more, I think a simple solution could be preprocessing the file to generate a list of proper names that don't start sentences then using those to filter out those that do. You'd still get wrong suggestions for proper nouns that started sentences and aren't seen anywhere else in the document - and the edge case also bothered me enough (coupled with the fact I ran out of time) that it felt pointless to implement it without a solution for the edge case.

## What I'd do to improve/if I had beeen laser focused on performance/productionalizing

I'd code a LevenshteinScorer impelementation. I didn't do that here for two reasons:

1. Again, I really wanted to play with vector embedding concepts and spent most of my time on that and didn't want to spend 6 hours on the assignment total.
2. I'd probably end up accidentally cheating in a rush to get it done on time. I don't think it's that complex but I haven't been asked algorithm questions in quite some time, although I appreciate this opportunity to get my feet wet a little at the start of my interview process.

If I had a lot more time I might actually try the vector embedding approach on sentences and having a lite llm suggest words based off the sentence embeddings -- i.e. predict words and replace the misspell with a prediction. This wouldn't be efficient at all but would be really cool and would run fine on actual human created content within reason - i.e. maybe don't run it on all of Pride and Prejudice but run it once in a while while writing Pride and Prejudice.

#Instructions for running

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run ./index.ts --dictionary_file dictionary.txt --spell_check_file test_file.txt
bun run ./index.ts --dictionary_file dictionary.txt --spell_check_file test_file.txt --use_vector
```

This project was created using `bun init` in bun v1.1.38. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
