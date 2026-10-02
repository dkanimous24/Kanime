// Guesses what kind of news a headline is. Pure helper: touches nothing else.
// Order matters: the first match wins, so put the most specific types first.
const NEWS_TYPES = [
  ["Delayed", /delay|postpone/i],
  ["Cast & staff", /\bcast\b|voice|staff/i],
  ["Announced", /announc|reveal|confirm/i],
  ["Trailer", /trailer|\bpv\b|teaser|visual/i],
  ["Release date", /premiere|release date|debut|streaming/i],
];

export const getNewsType = (title = "") =>
  NEWS_TYPES.find(([, re]) => re.test(title))?.[0] ?? "News";
