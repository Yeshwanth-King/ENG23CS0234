const LOG_URL = "http://4.224.186.213/evaluation-service/logs";

const allowedStacks = new Set(["frontend", "backend"]);
const allowedLevels = new Set(["debug", "info", "warn", "error", "fatal"]);
const allowedPackages = new Set([
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
]);

function getAuthToken() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ5ZXNodXllc2h3YW50aDIwMDVAZ21haWwuY29tIiwiZXhwIjoxNzgxODQ3MDQ0LCJpYXQiOjE3ODE4NDYxNDQsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIxYTc4MGEwZS0xZDYyLTQ0MWUtOWI4ZC02NDU3NzE5NzZiN2MiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJ5ZXNod2FudGgtciIsInN1YiI6Ijg2ZTkwMTQ2LTM3ODQtNDc4MC1iNzA3LTg2OGJiYzJjNzc0OCJ9LCJlbWFpbCI6Inllc2h1eWVzaHdhbnRoMjAwNUBnbWFpbC5jb20iLCJuYW1lIjoieWVzaHdhbnRoLXIiLCJyb2xsTm8iOiJlbmcyM2NzMDIzNCIsImFjY2Vzc0NvZGUiOiJCZ1daU1ciLCJjbGllbnRJRCI6Ijg2ZTkwMTQ2LTM3ODQtNDc4MC1iNzA3LTg2OGJiYzJjNzc0OCIsImNsaWVudFNlY3JldCI6Im5zV0h5TnhZemRmY3RUR3gifQ.n4cKfY9tQA7DwuEkTVofqSXplkegBJ98YNFFkCaAjMI"
  return token;
}

export async function Log(stack, level, packageName, message) {
  if (
    !allowedStacks.has(stack) ||
    !allowedLevels.has(level) ||
    !allowedPackages.has(packageName)
  ) {
    return;
  }

  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    await fetch(LOG_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message,
      }),
    });
  } catch (error) {
    console.error(error);
  }
}
