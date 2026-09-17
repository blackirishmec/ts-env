import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const exercisesDirectory = join(root, "exercises");
const buildDirectory = join(root, ".practice-build");
const compiler = join(root, "node_modules/typescript/bin/tsc");
const [command = "run", ...commandArguments] = process.argv.slice(2);
let clearConsole = false;
let parseWatchOptions = command === "watch";
const positionalArguments = [];
for (const argument of commandArguments) {
  if (parseWatchOptions && argument === "--") {
    parseWatchOptions = false;
  } else if (parseWatchOptions && argument === "--clear") {
    clearConsole = true;
  } else {
    positionalArguments.push(argument);
  }
}
const [selector, ...scriptArguments] = positionalArguments;

function exercises() {
  mkdirSync(exercisesDirectory, { recursive: true });
  return readdirSync(exercisesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^\d+-.+\.ts$/.test(entry.name) && !entry.name.endsWith(".d.ts"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
}

function createExercise() {
  if (!selector || scriptArguments.length > 0) {
    throw new Error('Give the exercise a name: npm run new -- pig-latin (or "Pig Latin").');
  }

  const slug = selector.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error("Use at least one letter or number in the exercise name.");

  const highestNumber = exercises().reduce((highest, file) => Math.max(highest, parseInt(file, 10)), 0);
  const number = String(highestNumber + 1).padStart(3, "0");
  const filename = `${number}-${slug}.ts`;
  const template = readFileSync(join(root, "templates/exercise.ts"), "utf8");
  writeFileSync(join(exercisesDirectory, filename), template.replaceAll("__EXERCISE_NAME__", slug), {
    flag: "wx",
  });

  console.log(`Created exercises/${filename}\n\nEdit that file, then run npm start or npm run watch.`);
}

function selectExercise() {
  const files = exercises();
  if (!selector) {
    if (!files.length) throw new Error("No exercises yet. Create one with npm run new -- my-exercise.");
    return join(exercisesDirectory, files.at(-1));
  }

  // Accept an explicit top-level .ts file, even if it was created by hand.
  const filename = basename(selector.endsWith(".ts") ? selector : `${selector}.ts`);
  for (const candidate of [resolve(root, selector), join(exercisesDirectory, filename)]) {
    if (dirname(candidate) === exercisesDirectory && existsSync(candidate)
      && candidate.endsWith(".ts") && !candidate.endsWith(".d.ts")) {
      return candidate;
    }
  }

  const matches = files.filter((file) => /^\d+$/.test(selector)
    ? parseInt(file, 10) === Number(selector)
    : file.replace(/^\d+-/, "").replace(/\.ts$/, "") === selector);
  if (matches.length === 1) return join(exercisesDirectory, matches[0]);
  if (matches.length > 1) {
    throw new Error(`More than one exercise matches "${selector}". Use its number:\n${matches.join("\n")}`);
  }
  throw new Error(`Exercise "${selector}" not found. Use npm run list to see saved exercises.`);
}

function compile(file, checkOnly = false) {
  if (!existsSync(compiler)) throw new Error("Install the dependencies first with npm install.");
  mkdirSync(buildDirectory, { recursive: true });
  const project = join(buildDirectory, `${basename(file, ".ts")}.tsconfig.json`);
  // A per-exercise config keeps unfinished old work out of this compilation.
  writeFileSync(project, JSON.stringify({
    extends: join(root, "tsconfig.json"),
    compilerOptions: {
      rootDir: exercisesDirectory,
      outDir: buildDirectory,
      noEmitOnError: true,
      noEmit: checkOnly,
    },
    files: [file],
    include: [],
  }, null, 2) + "\n");
  const result = spawnSync(process.execPath, [compiler, "--project", project], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status === 0;
}

function runJavaScript(file) {
  const output = join(buildDirectory, basename(file, ".ts") + ".js");
  console.log(`\nRunning exercises/${basename(file)}\n`);
  const child = spawn(process.execPath, ["--enable-source-maps", output, ...scriptArguments], {
    cwd: root,
    stdio: "inherit",
  });
  child.on("error", (error) => console.error(error.message));
  return child;
}

function watchExercise(file) {
  let child;
  let debounce;
  console.log(`Watching exercises/ for changes; running ${basename(file)}. Ctrl+C to stop.`);
  const rerun = (clear = true) => {
    // Stop a previous run (including an infinite loop) before checking the next version.
    child?.kill("SIGKILL");
    child = undefined;
    if (clear && clearConsole) console.clear();
    if (compile(file)) {
      child = runJavaScript(file);
      child.on("exit", (code) => {
        if (code) console.error(`Exercise exited with code ${code}. Save to try again.`);
      });
    } else {
      console.error("Fix the errors and save to try again.");
    }
  };
  const schedule = () => {
    clearTimeout(debounce);
    debounce = setTimeout(rerun, 150);
  };
  const watchers = [
    watch(exercisesDirectory, { recursive: true }, schedule),
    watch(root, (_event, filename) => {
      if (filename === "tsconfig.json" || filename === "package.json") schedule();
    }),
  ];
  for (const watcher of watchers) {
    watcher.on("error", (error) => {
      console.error(error.message);
      stop(1);
    });
  }
  function stop(code) {
    clearTimeout(debounce);
    for (const watcher of watchers) watcher.close();
    child?.kill("SIGKILL");
    process.exitCode = code;
  }
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => stop(signal === "SIGINT" ? 130 : 143));
  }
  rerun(false);
}

async function main() {
  if (command === "new") return createExercise();
  if (command === "list") {
    const files = exercises();
    console.log(files.map((file, index) => `${file}${index === files.length - 1 ? " (default)" : ""}`).join("\n")
      || "No exercises yet. Run npm run new -- my-exercise.");
    return;
  }
  if (!["run", "watch", "check"].includes(command)) throw new Error(`Unknown command: ${command}`);

  const file = selectExercise();
  if (command === "watch") return watchExercise(file);
  if (!compile(file, command === "check")) {
    process.exitCode = 1;
    return;
  }
  if (command === "check") {
    console.log(`Type check passed: exercises/${basename(file)}`);
    return;
  }

  const child = runJavaScript(file);
  const forwardSignal = (signal) => child.kill(signal);
  process.on("SIGINT", forwardSignal);
  process.on("SIGTERM", forwardSignal);
  child.on("error", () => { process.exitCode = 1; });
  child.on("exit", (code, signal) => {
    process.off("SIGINT", forwardSignal);
    process.off("SIGTERM", forwardSignal);
    process.exitCode = code ?? (signal === "SIGINT" ? 130 : 1);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
