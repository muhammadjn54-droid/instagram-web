# Authentication & Session Architecture — Instagram Web Clone

> **Document Version:** 1.0  
> **Mechanism:** Stateless JWT Authentication with Server Validation

---

## 1. Authentication Lifecycle

```
[ Visitor ] 
    │
    ├──> POST /account/login (or /account/register)
    │        │
    │        ▼
    │    [ NestJS Backend ]
    │        ├── Validate credentials via bcrypt
    │        └── Issue JWT { accessToken, refreshToken, user }
    │
    ▼
[ Client Application ]
    ├── Store token in localStorage ('instagram_token')
    ├── Set browser session cookie ('instagram_token=...; SameSite=Lax')
    └── Hydrate auth state -> Redirect to App Feed (/)
```

---

## 2. Token Storage & Transmission

* **Client Storage:**
  * Primary: `localStorage.getItem('instagram_token')`
  * Secondary: `document.cookie` (enables server components and middleware to verify session existence).
* **Outgoing Request Header:**
  All authenticated requests automatically append:
  ```http
  Authorization: Bearer <accessToken>
  ```
* **Expiration & Error Handling:**
  * When any API call returns `401 Unauthorized`, the client clears `localStorage` and `cookie`, then redirects to `/login`.

---

## 3. Route Guard Policy

| Route Pattern | Access Policy | Unauthenticated Action | Authenticated Action |
| :--- | :---: | :--- | :--- |
| `/login` | Public Only | Renders Login Card | Redirects to `/` |
| `/register` | Public Only | Renders Register Card | Redirects to `/` |
| `/` | Dynamic | Renders Split Hero Landing | Renders Authenticated Feed |
| `/explore` | Protected | Redirects to `/login` | Renders Explore Grid |
| `/reels` | Protected | Redirects to `/login` | Renders Reels Player |
| `/direct/**` | Protected | Redirects to `/login` | Renders Messaging Inbox |
| `/[username]`| Protected | Redirects to `/login` | Renders Profile |
| `/accounts/edit`| Protected | Redirects to `/login` | Renders Settings |

---

## 4. Verified Test Accounts

For automated and manual verification, the following 3 accounts exist in the SQLite database (seeded via `npm run seed`):
* `alex_photographer` (password: `Password123!`)
* `maria_art` (password: `Password123!`)
* `john_traveler` (password: `Password123!`)
* `mansur_dev` (password: `Password123!`)
