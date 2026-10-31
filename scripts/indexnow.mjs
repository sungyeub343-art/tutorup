// 배포 후 바뀐 페이지를 IndexNow(네이버·Bing 등)에 알려 수집을 앞당깁니다.
// 사용법: node scripts/indexnow.mjs        → 직전 커밋 대비 바뀐 페이지만 전송
//         node scripts/indexnow.mjs --all  → 사이트맵의 모든 페이지 전송
//         --dry-run을 붙이면 전송하지 않고 대상 URL만 출력
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "tutorup.kr";
const siteUrl = `https://${host}`;
const key = (await readFile(path.join(root, "src", "indexnow-key.txt"), "utf8")).trim();
const sitemap = await readFile(path.join(root, "dist", "sitemap.xml"), "utf8");
const allUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);

function changedUrls() {
  try {
    const files = execFileSync("git", ["-c", "core.quotepath=false", "diff", "--name-only", "HEAD~1", "HEAD", "--", "dist"], { cwd: root, encoding: "utf8" });
    return files.split("\n").filter(file => file.endsWith("index.html")).map(file => `${siteUrl}/${file.replace(/^dist\//, "").replace(/index\.html$/, "").split("/").map(encodeURIComponent).join("/")}`);
  } catch {
    return null;
  }
}

const changed = process.argv.includes("--all") ? null : changedUrls();
const urlList = changed ? allUrls.filter(url => changed.includes(url)) : allUrls;
if (!urlList.length) {
  console.log("IndexNow: 바뀐 페이지가 없어 전송하지 않습니다.");
  process.exit(0);
}
if (process.argv.includes("--dry-run")) {
  console.log(urlList.join("\n"));
  process.exit(0);
}

for (const endpoint of ["https://searchadvisor.naver.com/indexnow", "https://api.indexnow.org/indexnow"]) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${siteUrl}/${key}.txt`, urlList })
    });
    console.log(`IndexNow ${endpoint}: ${response.status} (${urlList.length}개 URL)`);
  } catch (error) {
    console.log(`IndexNow ${endpoint}: 전송 실패 - ${error.message}`);
  }
}
