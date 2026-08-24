import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + MAX_AGE)
    .sign(getSecretKey());
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieHeader(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookieHeader() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function getSessionFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return await verifySession(match[1]);
}

// Short-lived cookie used only to defend the account-link OAuth handshake
// against CSRF — holds a random value we compare against the `state` query
// param the provider hands back to the callback route.
const LINK_STATE_COOKIE = "link_state";

export function oauthStateCookieHeader(state) {
  return `${LINK_STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`;
}

export function clearOauthStateCookieHeader() {
  return `${LINK_STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getOauthStateFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${LINK_STATE_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export { COOKIE_NAME };
