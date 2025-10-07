export function getCookie(name) {
  if (!document || !document.cookie) return null;
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? match[2] : null;
}

export function getJwtToken() {
  const token = getCookie("token");

  if (!token) {
    window.location.href = "/login.html";
  }

  return token;
}

