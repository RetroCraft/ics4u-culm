import yargs from "yargs";
import { Argv } from "yargs";
import connect from "connect";
import serveStatic from "serve-static";
// .js imports are used to allow for browser transpilation
import { Parser } from "./Parser.js";
import { readFile, writeFile } from "fs";

const parser = new Parser();

yargs
  .command(
    "file [filename]",
    "Simplify a file",
    (yargs: Argv) => {
      return yargs.positional("filename", {
        describe: "File to simplify",
        type: "string"
      });
    },
    argv => {
      // read in file and parse data with parser
      readFile(argv.filename, "utf8", (err, data) => {
        if (err) return console.error("Unable to read file: " + err);
        const out = parser.simplify(data, true);

        console.log("Old file size: " + data.length);
        console.log("New file size: " + out.length);

        writeFile(
          `${argv.filename.substring(0, argv.filename.length - 3)}.smpl.js`,
          out,
          "utf8",
          err => err && console.error("Unable to write file: " + err)
        );
      });
    }
  )
  .command(
    "snip [code]",
    "Simplify a code snippet",
    (yargs: Argv) => {
      return yargs.positional("code", {
        describe: "Code to simplify",
        type: "string"
      });
    },
    argv => {
      console.log(parser.simplify(argv.code));
    }
  )
  .command("web", "Start a web server", {}, () => {
    connect()
      .use(serveStatic("./"))
      .listen(8080, () => {
        console.log("Server running on http://localhost:8080/front-end ...");
      });
  })
  .demandCommand()
  .help().argv;
