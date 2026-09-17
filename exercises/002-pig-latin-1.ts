import assert from 'node:assert/strict';

// Exercise: pig-latin-1
// Prompt: Create a function that converts a given string to Pig Latin.
// Approach: Ignore punctuation and capitalization
// Time / space complexity:

const toPigLatin = (sentence: string): string => {
	const VOWELS = 'aeoiu'; // cspell: disable-line

	return sentence.split(' ').reduce((acc, word, index) => {
		const firstLetterOfWord = word[0];
		const restOfWord = word.slice(1);

		if (firstLetterOfWord === undefined) return acc;

		if (index > 0) acc += ' ';

		if (VOWELS.includes(firstLetterOfWord)) {
			acc += firstLetterOfWord + restOfWord + 'yay';
		} else {
			acc += restOfWord + firstLetterOfWord + 'ay';
		}

		return acc;
	}, '');
};

function solve(input: string): string {
	// Replace the signature and implementation to fit the exercise.
	return toPigLatin(input);
}

// Add examples and edge cases here. Failed assertions stop the program.
assert.equal(
	solve('the quick brown fox jumps over the lazy dog'),
	'hetay uickqay rownbay oxfay umpsjay overyay hetay azylay ogday', // cspell:disable-line
);
console.log('All assertions passed!');
