#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";

const root = process.cwd();
const ignoredHtmlFiles = new Set(["brand-concepts.html"]);
const htmlFiles = readdirSync(root)
  .filter((file) => file.endsWith(".html") && !ignoredHtmlFiles.has(file))
  .sort();
const failures = [];
const cssFiles = new Set();
const gaMeasurementId = "G-3XSX6MTW32";

const assetExtensions = new Set([".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".ttf"]);

function fail(message) {
  failures.push(message);
}

function read(file) {
  return readFileSync(join(root, file), "utf8");
}

function localPathFromUrl(value, baseFile = "") {
  let path = value;
  if (value.startsWith("https://rankhydraulics.com/")) {
    path = value.replace("https://rankhydraulics.com/", "");
  }
  path = path.split("#")[0].split("?")[0].replace(/^\/+/, "");
  if (!path || value.startsWith("https://rankhydraulics.com/") || value.startsWith("/")) {
    return path;
  }
  return normalize(join(dirname(baseFile), path)).replaceAll("\\", "/");
}

function attributeValue(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? match[1] : "";
}

function shouldSkipUrl(value) {
  return (
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("data:") ||
    value.startsWith("https://formsubmit.co/") ||
    ((value.startsWith("http://") || value.startsWith("https://")) && !value.startsWith("https://rankhydraulics.com/"))
  );
}

function validateLocalReference(sourceFile, value, baseFile = sourceFile) {
  if (shouldSkipUrl(value)) {
    return;
  }

  const localPath = localPathFromUrl(value, baseFile);

  if (localPath.endsWith(".html")) {
    if (!existsSync(join(root, localPath))) fail(`${sourceFile}: linked HTML missing: ${value}`);
    return;
  }

  if (assetExtensions.has(extname(localPath))) {
    if (!existsSync(join(root, localPath))) fail(`${sourceFile}: referenced asset missing: ${value}`);
    if (extname(localPath) === ".css" && existsSync(join(root, localPath))) cssFiles.add(localPath);
  }
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

  if (/\bhref\s*=\s*["'](?:https:\/\/rankhydraulics\.com\/)?index\.html(?:[#"'])/i.test(html)) {
    fail(`${file}: link points to index.html instead of canonical homepage root`);
  }

  if (!html.includes(`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`)) {
    fail(`${file}: missing GA4 script for ${gaMeasurementId}`);
  }

  if (!html.includes(`gtag("config", "${gaMeasurementId}")`)) {
    fail(`${file}: missing GA4 config for ${gaMeasurementId}`);
  }

  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    const value = match[1];

    if (value.startsWith("https://wa.me/")) {
      const url = new URL(value);
      if (!url.pathname.includes("919849021685")) fail(`${file}: WhatsApp link missing expected phone number`);
      if (!url.searchParams.get("text")) fail(`${file}: WhatsApp link missing prefilled text`);
      continue;
    }

    validateLocalReference(file, value);
  }

  for (const match of html.matchAll(/\bcontent\s*=\s*["']([^"']+)["']/g)) {
    validateLocalReference(file, match[1]);
  }

  for (const scriptMatch of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const jsonLd = scriptMatch[1];
    for (const urlMatch of jsonLd.matchAll(/"https:\/\/rankhydraulics\.com\/[^"]*"/g)) {
      validateLocalReference(file, urlMatch[0].slice(1, -1));
    }
  }

  const formsubmitForms = [...html.matchAll(/<form\b[^>]*\baction\s*=\s*["']https:\/\/formsubmit\.co\/[^"']+["'][^>]*>/g)];
  for (const formMatch of formsubmitForms) {
    const formStart = formMatch.index || 0;
    const formEnd = html.indexOf("</form>", formStart);
    const formHtml = html.slice(formStart, formEnd > formStart ? formEnd : html.length);
    if (!hasHiddenInput(formHtml, "_next")) fail(`${file}: FormSubmit form missing _next hidden field`);
    if (!hasHiddenInput(formHtml, "_subject")) fail(`${file}: FormSubmit form missing _subject hidden field`);
  }
}

for (const cssFile of [...cssFiles].sort()) {
  const css = read(cssFile);
  for (const match of css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^'")]+))\s*\)/g)) {
    const value = (match[1] || match[2] || match[3] || "").trim();
    validateLocalReference(cssFile, value, cssFile);
  }
}

const sitemap = read("sitemap.xml");
for (const file of htmlFiles) {
  const loc = file === "index.html" ? "https://rankhydraulics.com/" : `https://rankhydraulics.com/${file}`;
  if (file !== "thanks.html" && !sitemap.includes(loc)) fail(`sitemap.xml: missing ${loc}`);
}

if (!sitemap.includes("<lastmod>2026-06-12</lastmod>")) {
  fail("sitemap.xml: expected updated lastmod date 2026-06-12");
}

if (failures.length) {
  console.error("Static site QA failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static site QA passed for ${htmlFiles.length} HTML files.`);
