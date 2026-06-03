#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const ignoredHtmlFiles = new Set(["brand-concepts.html"]);
const htmlFiles = readdirSync(root)
  .filter((file) => file.endsWith(".html") && !ignoredHtmlFiles.has(file))
  .sort();
const failures = [];

const localSchemes = /^(#|mailto:|tel:|https:\/\/wa\.me\/|https:\/\/formsubmit\.co\/|https:\/\/rankhydraulics\.com\/|https?:\/\/)/;
const assetExtensions = new Set([".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".ttf"]);

function fail(message) {
  failures.push(message);
}

function read(file) {
  return readFileSync(join(root, file), "utf8");
}

function localPathFromUrl(value) {
  if (value.startsWith("https://rankhydraulics.com/")) {
    return value.replace("https://rankhydraulics.com/", "");
  }
  return value.split("#")[0].split("?")[0];
}

function attributeValue(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"));
  return match ? match[1] : "";
}

function hasHiddenInput(formHtml, name) {
  for (const inputMatch of formHtml.matchAll(/<input\b[^>]*>/gi)) {
    const input = inputMatch[0];
    if (attributeValue(input, "name") === name && attributeValue(input, "type").toLowerCase() === "hidden") {
      return true;
    }
  }
  return false;
}

for (const file of htmlFiles) {
  const html = read(file);
  const editorialMarkers = ["T" + "BD", "TO" + "DO", "lorem ipsum"];

  if (editorialMarkers.some((marker) => html.includes(marker))) {
    fail(`${file}: contains unfinished editorial marker`);
  }

  for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    const localPath = localPathFromUrl(value);

    if (value.startsWith("https://wa.me/")) {
      const url = new URL(value);
      if (!url.pathname.includes("919849021685")) fail(`${file}: WhatsApp link missing expected phone number`);
      if (!url.searchParams.get("text")) fail(`${file}: WhatsApp link missing prefilled text`);
      continue;
    }

    if (value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("https://formsubmit.co/")) {
      continue;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
      continue;
    }

    if (value.startsWith("#")) {
      continue;
    }

    if (localPath.endsWith(".html")) {
      if (!existsSync(join(root, localPath))) fail(`${file}: linked HTML missing: ${value}`);
      continue;
    }

    if (assetExtensions.has(extname(localPath))) {
      if (!existsSync(join(root, localPath))) fail(`${file}: referenced asset missing: ${value}`);
    }
  }

  const formsubmitForms = [...html.matchAll(/<form\b[^>]*action=["']https:\/\/formsubmit\.co\/[^"']+["'][^>]*>/g)];
  for (const formMatch of formsubmitForms) {
    const formStart = formMatch.index || 0;
    const formEnd = html.indexOf("</form>", formStart);
    const formHtml = html.slice(formStart, formEnd > formStart ? formEnd : html.length);
    if (!hasHiddenInput(formHtml, "_next")) fail(`${file}: FormSubmit form missing _next hidden field`);
    if (!hasHiddenInput(formHtml, "_subject")) fail(`${file}: FormSubmit form missing _subject hidden field`);
  }
}

const sitemap = read("sitemap.xml");
for (const file of htmlFiles) {
  const loc = file === "index.html" ? "https://rankhydraulics.com/" : `https://rankhydraulics.com/${file}`;
  if (file !== "thanks.html" && !sitemap.includes(loc)) fail(`sitemap.xml: missing ${loc}`);
}

if (!sitemap.includes("<lastmod>2026-06-03</lastmod>")) {
  fail("sitemap.xml: expected updated lastmod date 2026-06-03");
}

if (failures.length) {
  console.error("Static site QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static site QA passed for ${htmlFiles.length} HTML files.`);
