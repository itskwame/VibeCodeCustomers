export const DEV_USER_ID = process.env.DEV_USER_ID ?? "dev-mode-user";

export function isDev() {
  return process.env.NODE_ENV !== "production";
}
