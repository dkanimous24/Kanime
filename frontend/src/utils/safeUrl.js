export function safeUrl(value) {
  if (typeof value !== "string") return;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return;

    return url.href;
  } catch (err) {
    return;
  }
}

console.log("TEST 1:", safeUrl("https://myanimelist.net/news"));
console.log("TEST 2:", safeUrl("javascript:alert('XSS')"));
console.log("TEST 3:", safeUrl("data:text/html,hello"));
console.log("TEST 4:", safeUrl("not-a-url"));
console.log("TEST 5:", safeUrl("http://example.com"));
