const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const releaseHash = args[0];

const SWpath = path.resolve(path.join(__dirname, "..", "dist", "service-worker.js"));
let f = fs.readFileSync(SWpath, "utf-8");

f = f.replace("<hash>", releaseHash);
fs.writeFileSync(SWpath, f);
