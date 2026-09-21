self.addEventListener("message", async (event) => {
  const { type, text } = event.data || {};

  if (type !== "check-comment") {
    return;
  }

  try {
    const response = await fetch("./inappropriate-words.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Could not load moderation dictionary (${response.status}).`);
    }

    const data = await response.json();
    const words = Array.isArray(data.words) ? data.words : [];
    const matchedWord = words.find((word) => containsForbiddenWord(text, String(word)));

    self.postMessage({
      allowed: !matchedWord,
      matchedWord: matchedWord || null
    });
  } catch (error) {
    self.postMessage({
      allowed: false,
      error: "Moderation could not be completed. Please try again."
    });
  }
});

function containsForbiddenWord(text, forbiddenWord) {
  const normalizedText = normalize(String(text));
  const normalizedWord = normalize(String(forbiddenWord)).replace(/[^a-z0-9]/g, "");

  if (!normalizedWord) {
    return false;
  }

  const separatedLettersPattern = normalizedWord
    .split("")
    .join("[^a-z0-9]*");

  const pattern = new RegExp(
    `(^|[^a-z0-9])${separatedLettersPattern}($|[^a-z0-9])`
  );

  return pattern.test(normalizedText);
}

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
