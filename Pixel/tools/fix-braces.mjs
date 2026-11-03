// Repairs the bad output of the first version of replace-urls.mjs:
//   const BASE_URL = {`${API_ORIGIN}/api`}   ->   const BASE_URL = `${API_ORIGIN}/api`
// JSX attributes like  src={`${API_ORIGIN}...`}  (no space before "=") are left alone.
//
//   node C:\Users\yasha\Desktop\pixel\pixel\Pixel\tools\fix-braces.mjs

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src")

const bad = /([\s=])=(\s*)\{(`\$\{API_ORIGIN\}[^`]*`)\}/g

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.(jsx?|tsx?)$/.test(e.name) ? [p] : []
  })
}

let total = 0
for (const file of walk(SRC)) {
  const text = fs.readFileSync(file, "utf8")
  if (!text.includes("API_ORIGIN")) continue
  let n = 0
  const out = text.replace(bad, (_m, ws, after, literal) => {
    n++
    return `${ws}=${after}${literal}`
  })
  if (n) {
    fs.writeFileSync(file, out, "utf8")
    total += n
    console.log(`✔ fixed ${n} in ${path.relative(SRC, file)}`)
  }
}
console.log(`\nDone: ${total} fixes.`)
