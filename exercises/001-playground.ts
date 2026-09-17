import assert from "node:assert/strict";

// Your first scratchpad. Replace this function and its examples with your work.
function sum(numbers: number[]): number {
  return numbers.reduce((total, number) => total + number, 0);
}

console.log("Hello, TypeScript!");
console.log("sum([1, 2, 3]) =", sum([1, 2, 3]));

assert.equal(sum([1, 2, 3]), 6);
assert.equal(sum([]), 0);
assert.equal(sum([-2, 2]), 0);
console.log("All assertions passed.");
