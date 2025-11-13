# Database Structure Analysis

## Current Structure

### Collections:
1. **`users`** - Contains ALL users (students, companies, institutes, admins)
   - Has a `role` field to differentiate
   - Contains all user authentication and profile data

2. **`institutions`** - Contains institution-specific data
   - Duplicates some data from `users` collection
   - Same document ID as the user's UID

3. **`companies`** - Contains company-specific data
   - Duplicates some data from `users` collection
   - Same document ID as the user's UID

## Design Approaches

### Option 1: Single Collection (Recommended for this use case)
**Structure:**
- Only `users` collection
- Use `role` field to filter: `where('role', '==', 'company')`
- All role-specific data stored in the same document

**Pros:**
- ✅ No data duplication
- ✅ Simpler queries (one collection)
- ✅ Easier to maintain
- ✅ Better for authentication/authorization
- ✅ Single source of truth
- ✅ Lower Firestore read costs

**Cons:**
- ❌ Slightly larger documents (but still within limits)
- ❌ Can't have different security rules per collection (but can use role-based rules)

### Option 2: Separate Collections (Current Hybrid)
**Structure:**
- `users` collection for authentication
- `companies` collection for company data
- `institutions` collection for institution data
- `students` collection (if we add it)

**Pros:**
- ✅ Can have different security rules per collection
- ✅ Cleaner separation of concerns
- ✅ Easier to query all companies/institutions without role filter

**Cons:**
- ❌ Data duplication
- ❌ More complex to maintain (update in multiple places)
- ❌ Higher Firestore read costs
- ❌ Risk of data inconsistency

### Option 3: Subcollections
**Structure:**
- `users/{userId}` - Main user data
- `users/{userId}/company` - Company-specific data
- `users/{userId}/institution` - Institution-specific data

**Pros:**
- ✅ No duplication
- ✅ Logical grouping
- ✅ Can query parent collection easily

**Cons:**
- ❌ More complex queries
- ❌ Can't easily query all companies across users

## Recommendation

**For this platform, Option 1 (Single Collection) is recommended because:**

1. **All entities are users first** - They all need authentication, profile, and basic info
2. **Role-based filtering works well** - Firestore queries with `where('role', '==', 'company')` are efficient
3. **Simpler maintenance** - One place to update user data
4. **Cost effective** - Fewer reads/writes
5. **Consistent with Firebase Auth** - Firebase Auth already treats everyone as a user

## Current Implementation Issues

The current hybrid approach creates:
- Data duplication between `users` and `companies`/`institutions`
- Maintenance overhead (need to update multiple collections)
- Potential inconsistency if one update fails

## Suggested Refactoring

1. **Keep only `users` collection** with role-based data
2. **Remove `companies` and `institutions` collections** (or migrate data)
3. **Update all queries** to use `users` collection with role filters
4. **Use Firestore security rules** to control access based on `role` field

## Example Structure

```javascript
// users/{userId}
{
  uid: "abc123",
  email: "company@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "company",  // or "student", "institute", "admin"
  
  // Role-specific fields (only present for that role)
  companyName: "Tech Corp",
  industry: "Technology",
  size: "50-100",
  website: "https://techcorp.com",
  
  // Common fields
  status: "approved",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Migration Path

If we want to simplify:
1. Query all documents from `companies` and `institutions` collections
2. Merge the data into corresponding `users` documents
3. Update all code to read from `users` collection only
4. Delete `companies` and `institutions` collections
5. Update Firestore security rules

