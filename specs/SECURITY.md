# Security & Data Protection Specification — Instagram Web Clone

> **Document Version:** 1.0  
> **Security Posture:** OWASP Top 10 Web Application Standards

---

## 1. Authentication & Token Safeguards

* **JWT Handling:**
  * Tokens are signed server-side using HMAC SHA-256 with `JWT_SECRET`.
  * Passwords are never returned in any API response (DTOs explicitly omit or strip `password`).
  * Expired tokens trigger immediate client-side session destruction and redirect to `/login`.
* **Cookie Flags:**
  * `SameSite=Lax` prevents CSRF attacks on standard navigation.
  * `Path=/` ensures cookie availability across all subroutes.

---

## 2. Input Sanitization & XSS Defense

* **React Rendering Engine:**
  * All user-supplied text (captions, comments, bios, usernames) is rendered using standard React JSX curly braces `{text}`, preventing script injection.
* **Link Target Security:**
  * External website links in user bios must include `rel="noopener noreferrer nofollow" target="_blank"`.

---

## 3. Upload & File Protection

* **Strict MIME Whitelisting:**
  * Only `image/jpeg`, `image/png`, and `image/webp` are accepted by Multer.
  * Any executable or unrecognized payload is rejected with `400 Bad Request`.
* **File Size Limit:**
  * Max 5 MB per file.
* **Server-side Renaming:**
  * Files are stored as unique timestamps + random suffixes (`Date.now() + '-' + Math.round(Math.random() * 1e9) + ext`) to completely prevent directory traversal and name collisions.
