import { setAuthTokenGetter } from "@/api-client";

export function initApiAuth() {
  setAuthTokenGetter(() => {
    return localStorage.getItem("salam_tech_token");
  });
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("salam_tech_token", token);
  } else {
    localStorage.removeItem("salam_tech_token");
  }
}
