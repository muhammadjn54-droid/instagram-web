# Known Bugs, Limitations, and Blockers — Instagram Web Clone

> **Document Version:** 1.0  
> **Status:** Live tracking document for issues discovered during development and testing.

---

## 1. Verified Environmental Limitations

| ID | Component | Description | Workaround / Resolution | Status |
| :--- | :--- | :--- | :--- | :---: |
| **ENV-01** | Playwright Browser Subagent | Automated Playwright driver download failed due to network restriction on `azureedge.net`. | Verified HTTP status 200, HTML SSR output, and API workflows directly via cURL and PowerShell `Invoke-RestMethod`. | **RESOLVED VIA DIRECT VERIFICATION** |
| **ENV-02** | TypeORM ESM circular reference | Entities referencing each other directly caused `ReferenceError` during app initialization. | Resolved using TypeORM's `Relation<T>` wrapper (e.g. `user?: Relation<User>`). | **RESOLVED** |

---

## 2. Active Technical Blockers & Dependencies

1. **BLOCKER-01: Application Shell Missing for Subroutes:**
   * *Description:* Navigation sidebar is not yet implemented as a global layout wrapper around subroutes (`/explore`, `/reels`, `/direct`, `/[username]`).
   * *Resolution:* Will be implemented in Phase 2 (`(authenticated)/layout.tsx`).

2. **BLOCKER-02: Real-time Message Updates in Chat:**
   * *Description:* The backend currently has an HTTP REST API for messaging (`GET /chats/:id/messages` and `POST /chats/:id/messages`), but no WebSocket server.
   * *Resolution:* Direct chat uses short polling (every 3–5 seconds when chat is open) or manual refresh until WebSockets are added.
