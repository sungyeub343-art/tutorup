import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const requiredKeywords = ["예비중1", "예비중2", "예비중3", "예비고1", "예비고2", "예비고3"];
const areaDirectories = await readdir(path.join(dist, "areas"), { withFileTypes: true });
const htmlFiles = [path.join(dist, "index.html"), ...areaDirectories.filter(entry => entry.isDirectory()).map(entry => path.join(dist, "areas", entry.name, "index.html"))];

if (htmlFiles.length !== 46) throw new Error(`Expected 46 index pages, found ${htmlFiles.length}`);
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  for (const keyword of requiredKeywords) {
    if (!html.includes(keyword)) throw new Error(`${path.relative(root, file)} is missing ${keyword}`);
  }
  if (!html.includes('<link rel="canonical" href="https://tutorup.kr')) throw new Error(`${path.relative(root, file)} has no canonical URL`);
  if (!html.includes('application/ld+json')) throw new Error(`${path.relative(root, file)} has no structured data`);
}

for (const file of ["CNAME", "robots.txt", "sitemap.xml", ".nojekyll", "404.html", "assets/style.css"]) {
  await access(path.join(dist, file));
}
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
if ((sitemap.match(/<url>/g) || []).length !== 46) throw new Error("Sitemap URL count does not match page count");
console.log(`Checked ${htmlFiles.length} pages, metadata, keywords, and deployment files`);