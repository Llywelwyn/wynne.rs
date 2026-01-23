export function isAdmin(userId: string | undefined): boolean {
  return userId === import.meta.env.ADMIN_GITHUB_ID;
}
