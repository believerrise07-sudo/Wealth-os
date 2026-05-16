# Security Specification for WealthOS

## Data Invariants
1. A profile document can only be accessed by the user whose UID matches the document ID.
2. The `email` in the profile must match the `email` in the auth token (if verified).
3. Financial items list size must be within reasonable limits to prevent "Denial of Wallet".

## The Dirty Dozen Payloads

1. **Payload**: `setDoc(profiles/victim-id, { profile: { ...attackerData } })`
   **Target**: Identity Integrity
   **Expected**: `PERMISSION_DENIED` - Attempting to write to another user's profile.

2. **Payload**: `updateDoc(profiles/my-id, { profile: { email: 'admin@wealthos.ai' } })`
   **Target**: Email Spoofing
   **Expected**: `PERMISSION_DENIED` - Attempting to change the authenticated email.

3. **Payload**: `setDoc(profiles/my-id, { profile: { email: 'me@me.com', onboarded: true }, extra_field: 'malicious' })`
   **Target**: Shadow Update (Ghost Fields)
   **Expected**: `PERMISSION_DENIED` - Schema validation should reject unknown root keys.

4. **Payload**: `setDoc(profiles/my-id, { income: "not an array", profile: { ... } })`
   **Target**: Type Poisoning
   **Expected**: `PERMISSION_DENIED` - `income` must be a list.

5. **Payload**: `setDoc(profiles/my-id, { income: [ { amount: -1000000000 } ], profile: { ... } })`
   **Target**: Value Poisoning
   **Expected**: `PERMISSION_DENIED` - Negative income or excessive values (if guarded).

6. **Payload**: `setDoc(profiles/my-id, { income: new Array(10000).fill({ ... }) })`
   **Target**: Denial of Wallet (Resource Exhaustion)
   **Expected**: `PERMISSION_DENIED` - List size exceeds maximum.

7. **Payload**: `getDoc(profiles/victim-id)`
   **Target**: PII Leakage
   **Expected**: `PERMISSION_DENIED` - Unauthorized read.

8. **Payload**: `deleteDoc(profiles/victim-id)`
   **Target**: Resource Destruction
   **Expected**: `PERMISSION_DENIED` - Unauthorized delete.

9. **Payload**: `updateDoc(profiles/my-id, { profile: { onboarded: 'string' } })`
   **Target**: Type Safety
   **Expected**: `PERMISSION_DENIED` - `onboarded` must be boolean.

10. **Payload**: `setDoc(profiles/my-id, { profile: { ... }, ventures: [ { irr: "invalid" } ] })`
    **Target**: Type Safety in nested objects
    **Expected**: `PERMISSION_DENIED` - `irr` must be number.

11. **Payload**: `setDoc(profiles/j-u-n-k-I-D, { ... })`
    **Target**: ID Poisoning
    **Expected**: `PERMISSION_DENIED` - ID must match regex and be auth.uid.

12. **Payload**: `query(collection(profiles), where('profile.email', '==', 'other@user.com'))`
    **Target**: Query Scraping
    **Expected**: `PERMISSION_DENIED` - List operations forbidden or strictly filtered.
