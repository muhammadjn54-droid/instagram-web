# Form Validation & Input Sanitization — Instagram Web Clone

> **Document Version:** 1.0  
> **Rule:** Validate synchronously on the client, sanitize on submission, enforce strictly on the server.

---

## 1. Authentication Forms

### Login Form (`AuthCard.tsx`)
* **Username / Email:**
  * Must not be empty after trimming whitespace.
  * Minimum 3 characters.
* **Password:**
  * Must not be empty.
* **Error Feedback:**
  * Inline red banner displaying message from backend (`"Invalid credentials"` translated to user-friendly Russian).

### Registration Form (`AuthCard.tsx` / `register/page.tsx`)
* **Email:**
  * Standard email pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
* **Full Name:**
  * Length: 1–100 characters.
* **Username:**
  * Pattern: `/^[a-zA-Z0-9._]{3,30}$/` (alphanumeric, periods, underscores).
* **Password:**
  * Minimum 6 characters.
* **Confirm Password:**
  * Strict equality check: `password === confirmPassword`. If not matching, submission is blocked with alert *"Пароли не совпадают"*.

---

## 2. Content Creation Forms

### Post Creation (`CreatePostModal.tsx`)
* **Media Files (`images`):**
  * Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
  * Count: Minimum 1 file, maximum 10 files.
  * File size limit: 5 MB per file.
* **Caption (`content`):**
  * Maximum 2,200 characters.

### Comment Submission (`InlineComment.tsx`)
* **Text:**
  * Minimum 1 character (trimmed), maximum 1,000 characters.
  * Submit on `Enter` key (without `Shift`).
