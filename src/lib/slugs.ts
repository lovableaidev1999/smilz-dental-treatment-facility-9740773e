export const normalizeServiceSlug = (value?: string | null) => {
  const raw = (value ?? "").trim();
  const withoutProtocol = raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const servicePath = withoutProtocol.includes("/services/")
    ? withoutProtocol.split("/services/").pop() ?? withoutProtocol
    : withoutProtocol;

  const clean = servicePath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return clean === "dental-implants" ? "dental-implants-garia-kolkata" : clean;
};

export const serviceSlugCandidates = (slug?: string | null) => {
  const clean = normalizeServiceSlug(slug);
  return Array.from(new Set([
    clean,
    `smilz.net/services/${clean}`,
    `www.smilz.net/services/${clean}`,
    `https://smilz.net/services/${clean}`,
    `https://www.smilz.net/services/${clean}`,
  ].filter(Boolean)));
};

export const servicePath = (slug?: string | null) => `/services/${normalizeServiceSlug(slug)}`;