import { spawn } from "child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";

const shouldRunEsBuild = process.argv.includes("--esbuild");
const shouldRunTsc = process.argv.includes("--tsc");

const tail = (process: ChildProcessWithoutNullStreams, name = "") => {
  process.stdout.on("data", (data) => {
    console.log(
      `${name ? `${name}: ` : ""}${data.toString().replace(/\n/g, "")}`
    );
  });
  process.stderr.on("data", (data) => {
    console.error(
      `${name ? `${name} ` : ""}error: ${data.toString().replace(/\n/g, "")}`
    );
  });
};
if (shouldRunEsBuild) {
  try {
    const esbuild = spawn("node", ["esbuild.js", "--watch"]);
    tail(esbuild, "esbuild");
  } catch (error) {
    console.error("Error running esbuild:", error);
    process.exit(1);
  }
}
if (shouldRunTsc) {
  try {
    const tsc = spawn("tsc", [
      "--noEmit",
      "--watch",
      "--project",
      "tsconfig.json",
    ]);
    tail(tsc, "tsc");
  } catch (error) {
    console.error("Error running tsc:", error);
    process.exit(1);
  }
}
