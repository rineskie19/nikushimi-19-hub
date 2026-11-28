const videoPattern = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input: string) {
  if (!URL.canParse(input)) return null;
  const url = new URL(input);
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;

  const [, path, value] = url.pathname.split("/");
  let id: string | null = null;
  if (url.hostname === "youtu.be") id = path;
  if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    if (["shorts", "live", "embed"].includes(path)) id = value;
  }
  return id && videoPattern.test(id) ? id : null;
}

export const watchUrl = (id: string) => "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
export const embedUrl = (id: string) => "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id);
