import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const gradeKeywords = ["예비중1", "예비중2", "예비중3", "예비고1", "예비고2", "예비고3"];
const levelKeywords = {
  elementary: ["초등 수학수업", "초등 수학공부", "초등 기초수학"],
  middle: ["중등 수학수업", "중등 수학공부", "중등 기초수학", "중등 수학내신"],
  high: ["고등 수학수업", "고등 수학공부", "고등 기초수학", "고등 수학내신", "고등 수능대비", "고등 수능수학"]
};
const allLevelKeywords = Object.values(levelKeywords).flat();
const areaDirectories = await readdir(path.join(dist, "areas"), { withFileTypes: true });
const areaFiles = areaDirectories.filter(entry => entry.isDirectory()).map(entry => path.join(dist, "areas", entry.name, "index.html"));
const levelFiles = Object.keys(levelKeywords).map(slug => path.join(dist, slug, "index.html"));
const schools = JSON.parse(await readFile(path.join(root, "src", "schools.json"), "utf8"));
const schoolFiles = schools.map(school => path.join(dist, "schools", school.name.replace(/\s+/g, "-"), "index.html"));
const gradeKeys = ["초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3", "고1", "고2", "고3"];
const gradeFiles = ["e1", "e2", "e3", "e4", "e5", "e6", "m1", "m2", "m3", "h1", "h2", "h3"].map(slug => path.join(dist, "grades", slug, "index.html"));
const htmlFiles = [path.join(dist, "index.html"), ...levelFiles, ...areaFiles, ...gradeFiles, ...schoolFiles];
const expectedPages = 49 + gradeFiles.length + schools.length;

if (htmlFiles.length !== expectedPages) throw new Error(`Expected ${expectedPages} index pages, found ${htmlFiles.length}`);
const titles = new Set();
const descriptions = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const name = path.relative(root, file);
  const level = Object.keys(levelKeywords).find(slug => file === path.join(dist, slug, "index.html"));
  const school = schools[schoolFiles.indexOf(file)];
  const grade = gradeKeys[gradeFiles.indexOf(file)];
  const required = grade ? ["수학과외", `제주 ${grade} 수학과외`] : school ? ["수학과외", school.name] : level ? ["수학과외", ...levelKeywords[level]] : ["수학과외", ...gradeKeywords, ...allLevelKeywords];
  for (const keyword of required) {
    if (!html.includes(keyword)) throw new Error(`${name} is missing ${keyword}`);
  }
  if (!html.includes('<link rel="canonical" href="https://tutorup.kr')) throw new Error(`${name} has no canonical URL`);
  if (!html.includes('"@type":"FAQPage"') || !html.includes('"@type":"BreadcrumbList"')) throw new Error(`${name} is missing structured data`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="(.*?)">/)?.[1];
  if (!title || titles.has(title)) throw new Error(`${name} has a missing or duplicate title`);
  if (!description || descriptions.has(description)) throw new Error(`${name} has a missing or duplicate description`);
  titles.add(title);
  descriptions.add(description);
}

const home = await readFile(path.join(dist, "index.html"), "utf8");
for (const school of schools) {
  if (!home.includes(school.name)) throw new Error(`index.html is missing ${school.name}`);
}
for (const file of areaFiles) {
  if (!(await readFile(file, "utf8")).includes('id="schools"')) throw new Error(`${path.relative(root, file)} has no school section`);
}

for (const file of ["CNAME", "robots.txt", "sitemap.xml", "rss.xml", ".nojekyll", "404.html", "assets/style.css", "favicon.ico", "favicon.svg", "apple-touch-icon.png"]) {
  await access(path.join(dist, file));
}
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
if ((sitemap.match(/<url>/g) || []).length !== expectedPages) throw new Error("Sitemap URL count does not match page count");
const rss = await readFile(path.join(dist, "rss.xml"), "utf8");
if ((rss.match(/<item>/g) || []).length !== expectedPages) throw new Error("RSS item count does not match page count");
console.log(`Checked ${htmlFiles.length} pages, metadata, keywords, and deployment files`);
