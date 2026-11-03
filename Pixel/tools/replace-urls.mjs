// One-off codemod: replaces every hardcoded http://127.0.0.1:8000 / http://localhost:8000
// in Pixel/src with API_ORIGIN from src/config/env.js
//
// Run from anywhere (it locates Pixel/src by itself):
//   node C:\Users\yasha\Desktop\pixel\pixel\Pixel\tools\replace-urls.mjs
// or from inside the Pixel folder:   node tools/replace-urls.mjs
// (Review the result with `git diff` afterwards.)

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(__dirname, "..", "src")
const ENV_FILE = path.join(SRC, "config", "env.js")

const ORIGIN = "http:\\/\\/(?:127\\.0\\.0\\.1|localhost):8000"

// "http://127.0.0.1:8000/api/x/"  or  'http://...'  ->  `${API_ORIGIN}/api/x/`
const quoted = new RegExp(`(["'])${ORIGIN}([^"'\\n]*)\\1`, "g")
// remaining occurrences (already inside template literals)
const bare = new RegExp(ORIGIN, "g")

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.(jsx?|tsx?)$/.test(e.name) ? [p] : []
  })
}

let changedFiles = 0
let totalReplacements = 0

for (const file of walk(SRC)) {
  if (path.resolve(file) === ENV_FILE) continue

  const original = fs.readFileSync(file, "utf8")
  if (!new RegExp(ORIGIN).test(original)) continue

  let count = 0

  let out = original.replace(quoted, (match, _q, rest, offset, whole) => {
    count++
    const literal = "`${API_ORIGIN}" + rest.replace(/`/g, "\\`") + "`"
    // JSX attribute such as src="http://..."  ->  src={`...`}
    const before = whole.slice(0, offset).trimEnd()
    return before.endsWith("=") ? `{${literal}}` : literal
  })

  out = out.replace(bare, () => {
    count++
    return "${API_ORIGIN}"
  })

  if (!/import\s*\{[^}]*\bAPI_ORIGIN\b[^}]*\}\s*from/.test(out)) {
    let rel = path
      .relative(path.dirname(file), path.join(SRC, "config", "env"))
      .split(path.sep)
      .join("/")
    if (!rel.startsWith(".")) rel = "./" + rel
    out = `import { API_ORIGIN } from "${rel}"\n` + out
  }

  fs.writeFileSync(file, out, "utf8")
  changedFiles++
  totalReplacements += count
  console.log(`✔ ${path.relative(SRC, file)}  (${count})`)
}

console.log(`\nDone: ${totalReplacements} replacements in ${changedFiles} files.`)
