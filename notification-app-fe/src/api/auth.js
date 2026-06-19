const AUTH_URL = "/evaluation-service/auth";
const STORAGE_KEY = "evaluation_access_token";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

function getExpiry(token) {
  const payload = decodeToken(token);
  return payload.exp ?? payload.MapClaims?.exp ?? 0;
}

function isTokenValid(token) {
  if (!token) {
    return false;
  }

  return getExpiry(token) * 1000 > Date.now() + 30000;
}

function getSavedToken() {
  const savedToken = localStorage.getItem(STORAGE_KEY);

  if (isTokenValid(savedToken)) {
    return savedToken;
  }

  const envToken = import.meta.env.VITE_TOKEN || import.meta.env.TOKEN;

  if (isTokenValid(envToken)) {
    localStorage.setItem(STORAGE_KEY, envToken);
    return envToken;
  }

  return "";
}

export async function getAccessToken() {
  const savedToken = getSavedToken();

  if (savedToken) {
    return savedToken;
  }

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: import.meta.env.VITE_EMAIL,
      name: import.meta.env.VITE_NAME,
      rollNo: import.meta.env.VITE_ROLL_NO,
      accessCode: import.meta.env.VITE_ACCESS_CODE,
      clientID: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not get access token");
  }

  const data = await response.json();
  localStorage.setItem(STORAGE_KEY, data.access_token);

  return data.access_token;
}
