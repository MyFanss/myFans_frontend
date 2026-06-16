# API Client

Thin HTTP client layer for communicating with the NestJS backend.

## Configuration

The client reads the API base URL from `NEXT_PUBLIC_API_URL` environment variable. If not set, it defaults to `http://localhost:3000`.

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Token Management

Tokens are stored in `localStorage` under the key `auth_token`. The client automatically attaches the token as an `Authorization: Bearer <token>` header for all requests.

### Setting a Token

After login/signup, store the token:

```typescript
import { api } from "@/lib/api/client";
import { AuthResponse } from "@/types/api";

const response = await api.post<AuthResponse>("/auth/login", {
  email: "user@example.com",
  password: "password",
});

api.setToken(response.access_token);
```

### Clearing a Token

On logout:

```typescript
api.clearToken();
```

## Usage Examples

### GET Request

```typescript
import { api } from "@/lib/api/client";

const users = await api.get("/users");
const user = await api.get(`/users/123`);
const filtered = await api.get("/users", {
  params: { role: "admin", active: true },
});
```

### POST Request

```typescript
const newUser = await api.post("/users", {
  email: "user@example.com",
  name: "John Doe",
});
```

### Typed Responses

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

const user = await api.get<User>("/users/123");
```

### Error Handling

```typescript
import { ApiError, NetworkError } from "@/lib/api/errors";

try {
  await api.post("/auth/login", { email, password });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.statusCode}:`, error.data);
  } else if (error instanceof NetworkError) {
    console.error("Network failed:", error.message);
  }
}
```

## Server-Side Limitations

The client's token management (localStorage) is client-only. For server-side requests (API routes, Server Components):

- Token attachment will be skipped automatically
- Use alternative auth mechanisms (cookies, headers passed from client)
- Consider middleware for attaching credentials to SSR requests

## HTTP Methods

All methods follow the same pattern:

```typescript
api.get<T>(endpoint, options?)
api.post<T>(endpoint, body?, options?)
api.put<T>(endpoint, body?, options?)
api.patch<T>(endpoint, body?, options?)
api.delete<T>(endpoint, options?)
```

Parameters:
- `endpoint`: Path relative to API base URL (e.g., `/auth/login`)
- `body`: Request body (automatically JSON-stringified)
- `options`: Fetch options including `params` for query strings
