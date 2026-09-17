import assert from 'node:assert/strict';

// Exercise: pig-latin-2
// Prompt: Create a function that converts a given string to Pig Latin.
// Approach: Handle punctuation ignore capitalization
// Time / space complexity:

const toPigLatin = (sentence: string): string => {
	const VOWELS = 'aeiou'; // cspell:disable-line
	const PUNCTUATION_UNICODE_PATTERN = /\p{P}/gu;

	return sentence.split(' ').reduce((acc, word, index) => {
		if (!word.length) return acc;

		const firstLetterOfWord = word[0];

		if(firstLetterOfWord === undefined) return acc;

		if(index > 0) acc += " ";

		let restOfWord = word.slice(1);

		const restOfWordPunctuation = restOfWord.match(PUNCTUATION_UNICODE_PATTERN)?.join() ?? '';
		if(restOfWordPunctuation.length > 0)
		{
			const restOfWordLetters = restOfWord.replaceAll(PUNCTUATION_UNICODE_PATTERN,'') ?? '';

			if(restOfWordLetters.length > 0)
			{
				restOfWord = restOfWordLetters;
			}
		}

		if(VOWELS.includes(firstLetterOfWord)) return acc + firstLetterOfWord + restOfWord + 'yay' + restOfWordPunctuation;

		return acc + restOfWord + firstLetterOfWord + 'ay' + restOfWordPunctuation;
	}, '');
};

function solve(input: string): string {
	// Replace the signature and implementation to fit the exercise.
	return toPigLatin(input);
}

// Add examples and edge cases here. Failed assertions stop the program.
assert.equal(
	solve('the quick brown fox jumps over, the lazy dog!'),
	'hetay uickqay rownbay oxfay umpsjay overyay, hetay azylay ogday!', // cspell:disable-line
);
console.log('All assertions passed!');
