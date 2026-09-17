# TypeScript practice

A local scratchpad for coding challenges, interview practice, and TypeScript experiments. Each exercise lives in its own file, so you can keep every attempt.

## Start here

You need Node.js 20 or newer and npm. Install dependencies once:

```sh
npm install
npm start
```

The starter at `exercises/001-playground.ts` prints some output and runs a few assertions. Edit it and run again, or use **watch mode** to compile and run every time you save:

```sh
npm run watch
```

Press Ctrl+C to stop watching. Output stays in your terminal so you can compare runs.

## Start a new challenge

```sh
npm run new -- pig-latin
```

This creates `exercises/002-pig-latin.ts` from `templates/exercise.ts`. Open the new file, write your solution and example cases, then run:

```sh
npm start
# Or rerun automatically on save:
npm run watch
```

**Without an exercise argument, commands select the highest-numbered file.** Creating another exercise leaves all previous files intact. Reusing a name creates another numbered attempt. An already-running watcher stays on its selected exercise; restart it to switch.

## Revisit old work

```sh
npm run list
npm start -- 1
npm run watch -- pig-latin
npm run check -- 002-pig-latin
```

Select an exercise by number, unique name, filename, or path such as `exercises/002-pig-latin.ts`. If you have multiple `pig-latin` attempts, use their numbers to distinguish them.

You can also create files yourself directly in `exercises/`. Numbered files such as `003-two-sum.ts` appear in the list and participate in default selection. An unnumbered file works when selected explicitly: `npm start -- exercises/scratch.ts`.

| Command | What it does |
| --- | --- |
| `npm run new -- <name>` | Create a new numbered exercise without overwriting old work |
| `npm start -- [exercise]` | Type-check, compile, and run an exercise |
| `npm run watch -- [exercise]` | Type-check, compile, and rerun when files under `exercises/` change |
| `npm run check -- [exercise]` | Type-check an exercise without running it |
| `npm run list` | List numbered exercises and show the default |
| `npm run check:all` | Optionally type-check every file under `exercises/` |

`[exercise]` is optional; leave it out to use the newest numbered exercise.

## Writing solutions

Use `console.log`, `console.table`, and Node's built-in assertions for quick feedback. The template gives you space for a prompt, approach, complexity notes, and example cases. Change or delete any of it.

```ts
import assert from "node:assert/strict";

function double(value: number): number {
  return value * 2;
}

console.log(double(21));
assert.equal(double(21), 42);
assert.equal(double(0), 0);
```

- **Type errors prevent execution.** Normal runs check only the selected exercise and its imports. An unfinished old solution won't block today's work.
- Every file is a separate module, so different exercises can reuse names like `solve`, `Node`, and `input`. Top-level `await` works too.
- Strict checking is enabled, including potentially missing array elements and object keys. For type-level quizzes, use `// @ts-expect-error` directly above a line you deliberately expect to fail type checking.
- Split larger exercises into helpers, for example `exercises/helpers/strings.ts`, and import them with `import { helper } from "./helpers/strings.ts"`. Helpers are compiled and watched with the exercise.
- Pass runtime arguments after the exercise: `npm start -- 1 hello 42`. Read them with `process.argv.slice(2)`. Standard input is also available. Relative filesystem paths are resolved from the repo root.
- This is a Node.js environment; browser APIs such as `document` aren't available. Use `npm install <package>` if an exercise needs another library.

## Files

```text
exercises/        Your saved work; keep these files in Git
templates/        Edit exercise.ts to customize future exercises
scripts/          The practice command runner
tsconfig.json     TypeScript settings
.practice-build/  Generated JavaScript and source maps; ignored by Git
```

The runner invokes the standard TypeScript compiler (`tsc`) with a temporary config for the selected exercise. [Module detection](https://www.typescriptlang.org/tsconfig/moduleDetection.html) keeps files independent, and [relative import rewriting](https://www.typescriptlang.org/tsconfig/rewriteRelativeImportExtensions.html) lets local imports use `.ts` extensions. Stack traces point back to your TypeScript source.

Watch mode also reloads changes to `tsconfig.json` and `package.json`. Generated JavaScript and temporary configs can be discarded; your `.ts` files are the source of truth. Commit exercises whenever you want a checkpoint or a record of your progress.
