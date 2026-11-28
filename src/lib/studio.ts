export const studioPath = "/nikushimi19/studio";
export const modes = [
  { value: "open", label: "Open", description: "Anyone can browse apps and follow enabled links." },
  { value: "maintenance", label: "Maintenance", description: "Only the owner can access the catalog and release links." },
  { value: "members", label: "Rowell Mode", description: "Visitors sign in with an account you create before accessing apps and links." },
] as const;
