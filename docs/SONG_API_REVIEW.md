# Song API Review Summary

## ✅ What's Working Well

### 1. **Core CRUD Endpoints** (Main route: `/app/api/song/`)

- **GET /api/song** - List songs with full filtering support ✅
  - Query params: `level`, `key`, `author`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
  - Returns paginated results with metadata
  - Handles missing user profiles by auto-creating them with defaults
- **GET /api/song/[id]** - Fetch single song ✅
  - Returns 404 if not found
  - Requires authentication
- **POST /api/song** - Create new song ✅
  - Validates input using `SongInputSchema`
  - Role-based access: requires `isAdmin` OR `isTeacher`
  - Handles missing profiles gracefully
- **PUT /api/song** - Update song ✅
  - Uses query parameter `?id=songId`
  - Currently restricted to admins only
  - Auto-updates `updated_at` timestamp
- **DELETE /api/song** - Delete song ✅
  - Uses query parameter `?id=songId`
  - Currently restricted to admins only

### 2. **Specialized Endpoints**

- **POST /api/song/create** - Alternative create endpoint with schema validation
- **GET /api/song/search** - Advanced search with multiple filters (level, key, author, hasAudio, hasChords)
- **PUT /api/song/update** - Alternative update endpoint
- **GET /api/song/student-songs** - Fetch student's assigned songs with status tracking
- **GET /api/song/admin-songs** - Admin utility to view specific user's songs
- **GET /api/song/favorites** - User favorites management
- **GET /api/song/user-songs** - User's personal song collection
- **GET /api/song/stats** - Song statistics and analytics
- **POST /api/song/bulk** - Bulk operations
- **GET /api/song/export** - Export songs data

### 3. **Smart Profile Handling**

- Auto-creates user profiles if missing (PGRST116 error handling)
- Sets default values: `isAdmin: false`, `isStudent: true`, `isTeacher: false`
- Prevents errors from blocking API responses

### 4. **Validation & Error Handling**

- Zod schema validation on input
- Clear HTTP status codes (400, 401, 403, 404, 422, 500)
- Detailed error responses with validation details
- Console logging for debugging

### 5. **Query Support**

- Search functionality with `ilike` (case-insensitive)
- Multiple filter options
- Pagination with `page`, `limit`
- Sorting: customizable field + direction
- Range queries for results slicing

---

## 🚨 Critical Issues Found

### 1. **Inconsistent Authorization Model**

**Problem**: Different endpoints use different role checks

- Main `PUT /api/song`: Only allows admins (`!isAdmin` → 403)
- Main `POST /api/song`: Allows `isAdmin` OR `isTeacher` ✅ (Correct)
- Alternative endpoints (`create/`, `update/`) use different patterns
- `student-songs/`: Uses `isAdmin` check (should students access their own?)

**Impact**: Security inconsistency, confusing permissions model

**Recommendation**: Standardize to: `POST/PATCH/DELETE` require `isTeacher || isAdmin`

---

### 2. **ESLint Code Quality Issues** (20 problems)

| File                       | Issues                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| `/route.ts` (main)         | ❌ **307 lines** (max 300), complexity 18-12 in GET/POST/PUT/DELETE |
| `/bulk/route.ts`           | Complexity 19, 146 lines                                            |
| `/export/route.ts`         | Complexity 22, 112 lines                                            |
| `/stats/route.ts`          | Complexity 20, 94 lines                                             |
| `/user-songs/route.ts`     | **Complexity 26** (worst!), 199 lines                               |
| `/search/route.ts`         | Complexity 17                                                       |
| `/handlers.ts`             | Complexity 14                                                       |
| `/favorites/route.ts`      | Complexity 11                                                       |
| `/user-test-song/route.ts` | Complexity 11                                                       |

**Action Required**: Refactor complex functions into smaller handlers (like you already did in `handlers.ts`)

---

### 3. **Duplicate Endpoint Paths**

**Problem**: Multiple ways to do the same thing:

- `GET /api/song` vs `GET /api/song/search` (both fetch songs)
- `POST /api/song` vs `POST /api/song/create` (both create)
- `PUT /api/song?id=X` vs `PUT /api/song/update` (both update)

**Impact**: Maintenance burden, client confusion, unclear which to use

**Recommendation**: Choose one canonical path per operation

---

### 4. **Inconsistent URL Parameter Patterns**

- Main route uses query params: `PUT /api/song?id=songId` (works but unusual)
- Dynamic route uses path params: `GET /api/song/[id]` (standard)

**Best Practice**: Use path parameters: `/api/song/[id]` for dynamic operations

---

### 5. **Missing Authentication Checks in Some Endpoints**

- `PUT /api/song/update` - ❌ No user authentication check!
- `POST /api/song/bulk` - Likely missing checks
- `GET /api/song/export` - Likely missing permission validation

**Impact**: Potential unauthorized access to sensitive operations

---

### 6. **Incomplete Teachers vs Admins Authorization**

- Update (`PUT /api/song`) only allows admins
- But POST allows both `isTeacher` and `isAdmin`
- This is inconsistent - if teachers can CREATE, they should be able to UPDATE/DELETE their own songs

**Recommendation**: Add song ownership check - teachers can edit/delete their own songs, admins can edit/delete any song

---

### 7. **Missing Type Imports in Some Files**

- `student-songs/route.ts` imports `Song` type but it's not consistently used
- Type casting warnings: `fav as { song: Song }`
- Some files use `any` to bypass type checking

---

## 📋 File-by-File Status

| Endpoint                 | Lines      | Complexity     | Status                                 |
| ------------------------ | ---------- | -------------- | -------------------------------------- |
| Main `route.ts`          | **307** ⚠️ | 18/12/11/11 ⚠️ | Needs refactor                         |
| `[id]/route.ts`          | ~40        | Low ✅         | Clean                                  |
| `handlers.ts`            | ~60        | 14 ⚠️          | Extracting well, minor refactor needed |
| `search/route.ts`        | ~70        | 17 ⚠️          | Needs refactor                         |
| `student-songs/route.ts` | **199** ⚠️ | **26** 🔴      | **Needs urgent refactor**              |
| `bulk/route.ts`          | 146 ⚠️     | 19 ⚠️          | Needs refactor                         |
| `export/route.ts`        | 112 ⚠️     | 22 ⚠️          | Needs refactor                         |
| `stats/route.ts`         | 94 ⚠️      | 20 ⚠️          | Needs refactor                         |
| `admin-songs/route.ts`   | ~40        | Low ✅         | Clean                                  |
| `create/route.ts`        | ~50        | Low ✅         | Clean                                  |
| `update/route.ts`        | ~50        | Low ✅         | Clean                                  |

---

## 🎯 Recommendations (Priority Order)

### Priority 1: Fix Main Route (307 lines error)

```bash
# Split /app/api/song/route.ts into separate handlers
# Move each method (GET, POST, PUT, DELETE) to its own handler function
```

### Priority 2: Standardize Authorization

```typescript
// Canonical pattern:
const { isTeacher, isAdmin } = profile || {};
const canManage = isTeacher || isAdmin;

// For specific operations:
if (!user) return 401; // Auth required
if (!canManage) return 403; // Permission required
```

### Priority 3: Consolidate Duplicate Routes

- Keep main routes: `GET /api/song`, `GET /api/song/[id]`, `POST /api/song`, `PATCH /api/song/[id]`, `DELETE /api/song/[id]`
- Remove or redirect alternatives

### Priority 4: Refactor Complex Functions

- Extract handler logic from main route handlers
- Move complexity to `handlers.ts` like you already started
- Keep route files under 80 LOC

### Priority 5: Add Missing Auth Checks

- Review all endpoints for missing user validation
- Add role checks consistently

---

## ✅ What's Good to Keep

1. **Profile auto-creation** - Smart error handling
2. **Pagination support** - Necessary for large datasets
3. **Multiple filter options** - Good UX
4. **Zod validation** - Type-safe input handling
5. **Handler extraction** - `handlers.ts` is good pattern
6. **Query logging** - Helpful for debugging

---

## 📝 Implementation Notes

**Good News**: The API is **functionally complete** and **working**. The issues are mostly about:

- Code organization (complexity/line limits)
- Authorization consistency
- Path duplication

**Estimated Refactor Time**: 3-4 hours to clean up and standardize

---

## Next Steps

1. **Run tests** on existing endpoints to ensure functionality
2. **Refactor main route** to split methods into handlers
3. **Standardize authorization** across all endpoints
4. **Create API documentation** with canonical paths
5. **Test with client** (SongList, SongForm components)

Would you like me to proceed with refactoring the most critical issues (main route size + complexity)?
