# Security Specification - Mera AI

## 1. Data Invariants
- Each user profile document at `/users/{userId}` can only be accessed and modified by the authenticated user whose `request.auth.uid == userId`.
- Each conversation at `/users/{userId}/conversations/{conversationId}` must have `userId == request.auth.uid`. No user can read, list, create, or modify conversations belonging to any other user.
- Document IDs must conform to `^[a-zA-Z0-9_\-]+$` and length `<= 128`.
- Title size must be `<= 200` characters.
- System denies all operations by default (`match /{document=**} { allow read, write: if false; }`).

## 2. Dirty Dozen Attack Payloads
1. User A attempts to read User B's profile document -> REJECTED (PERMISSION_DENIED).
2. Unauthenticated request attempts to read `/users/{userId}` -> REJECTED.
3. User A attempts to write a conversation under `/users/{userB}/conversations/{conv1}` -> REJECTED.
4. User A attempts to list conversations of User B -> REJECTED.
5. Injected oversized string (> 128 chars) into `userId` path -> REJECTED by `isValidId`.
6. Document creation with missing `userId` or spoofed `userId` -> REJECTED.
7. Unauthenticated request calls write on conversation -> REJECTED.
8. Attacker attempts to inject malicious script in title field (> 200 chars) -> REJECTED.
9. Attacker attempts to update `userId` on existing conversation -> REJECTED (immutability check).
10. Attacker attempts to query all conversations across all users with collectionGroup without auth -> REJECTED.
11. Attacker attempts to delete another user's conversation -> REJECTED.
12. Attacker sends null or ghost fields bypassing validation -> REJECTED.
