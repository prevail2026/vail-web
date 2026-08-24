// The single source of truth for which account-linking providers exist.
// To add a new provider: add an entry here, a lib/<provider>.js with the
// same shape as lib/github.js / lib/spotify.js, and a widget component.
export const PROVIDERS = {
  github: {
    id: "github",
    label: "GitHub",
    description: "Show your follower count, public repos, and profile link.",
    color: "#8b8f98",
  },
  spotify: {
    id: "spotify",
    label: "Spotify",
    description: "Show the track you're currently listening to, live.",
    color: "#2ec27a",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);
