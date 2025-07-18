# Session Validation System Documentation

## Overview

The Session Validation System provides automatic session monitoring, validation, and logout detection for the Next.js application. It integrates seamlessly with NextAuth and provides real-time feedback to users about their authentication status.

## Features

### ✅ **Automatic Session Validation**
- Periodic session checks (configurable interval, default: 5 minutes)
- Validation on user activity (mouse, keyboard, scroll events)
- Validation when browser tab becomes visible
- Validation on route changes to protected pages

### ✅ **Smart Logout Detection**
- Detects server-side session invalidation
- Handles token expiration
- Monitors API response status codes (401 Unauthorized)
- Automatic redirect to login page

### ✅ **User Experience Features**
- Toast notifications for session expiration
- Visual session status indicators
- Session warning banners for critical operations
- Non-intrusive validation (doesn't interrupt user workflow)

### ✅ **Developer Tools**
- Hooks for custom session validation logic
- API client with automatic session validation
- Form submission helpers with session checks
- Manual session validation controls

## Components

### 1. SessionValidationProvider

The main context provider that manages session validation state.

```tsx
<SessionValidationProvider 
  validationInterval={5 * 60 * 1000} // 5 minutes
  enableAutoValidation={true}
>
  {children}
</SessionValidationProvider>
```

**Props:**
- `validationInterval`: Time between automatic validations (ms)
- `enableAutoValidation`: Enable/disable automatic validation

### 2. Session Status Components

Visual indicators for session status:

```tsx
// Icon with tooltip
<SessionStatus variant="icon" showLastValidation={true} />

// Badge display
<SessionStatus variant="badge" />

// Full status with controls
<SessionStatus variant="full" showLastValidation={true} />

// Minimal indicator dot
<SessionIndicator />

// Warning banner for invalid sessions
<SessionWarningBanner />
```

## Hooks

### 1. useSessionValidation

Main hook for session validation functionality:

```tsx
const {
  isValidating,
  lastValidation,
  isSessionValid,
  validateSession,
  hasValidated,
  isAuthenticated,
  isLoading
} = useSessionValidation({
  onSessionExpired: () => console.log('Session expired'),
  onSessionValid: () => console.log('Session valid'),
  validateOnMount: true,
  validateOnFocus: true
})
```

### 2. useAuthenticatedFetch

Fetch wrapper with automatic session validation:

```tsx
const { authenticatedFetch } = useAuthenticatedFetch()

const response = await authenticatedFetch('/api/data', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### 3. useAuthenticatedSubmit

Form submission with session validation:

```tsx
const { submitWithAuth, isSubmitting } = useAuthenticatedSubmit()

await submitWithAuth('/api/users', userData, {
  method: 'POST',
  successMessage: 'User created successfully',
  onSuccess: (result) => console.log('Success:', result)
})
```

### 4. useCriticalPageSessionCheck

Enhanced validation for critical pages:

```tsx
const { lastCheck, isSessionValid, forceCheck } = useCriticalPageSessionCheck(2 * 60 * 1000) // 2 minutes
```

## API Client

Centralized API client with session validation:

```tsx
import { api } from '@/lib/api-client'

// Automatic session validation on all requests
const users = await api.get('/api/users')
const result = await api.post('/api/users', userData)
```

## Configuration

### Root Layout Integration

```tsx
// app/layout.tsx
import { SessionValidationProvider } from '@/contexts/SessionValidationContext'

export default function RootLayout({ children }) {
  return (
    <SessionProvider session={session}>
      <SessionValidationProvider 
        validationInterval={5 * 60 * 1000}
        enableAutoValidation={true}
      >
        {children}
      </SessionValidationProvider>
    </SessionProvider>
  )
}
```

### Environment Variables

No additional environment variables required. Uses existing NextAuth configuration.

## Validation Triggers

### Automatic Triggers
1. **Periodic Validation**: Every 5 minutes (configurable)
2. **User Activity**: Mouse movement, clicks, keyboard input, scrolling
3. **Tab Focus**: When user returns to the browser tab
4. **Route Changes**: Navigation to protected routes
5. **API Calls**: Before making authenticated requests

### Manual Triggers
1. **Component Actions**: Session status button clicks
2. **Hook Calls**: `validateSession()` function
3. **API Errors**: 401 responses trigger validation

## Error Handling

### Session Expiration Flow
1. Session validation detects invalid session
2. Toast notification shows to user
3. Automatic sign out from NextAuth
4. Redirect to login page with callback URL
5. User can click toast action to go directly to login

### API Error Handling
1. 401 responses automatically trigger session validation
2. Session validation initiates logout flow
3. Error messages shown to user
4. Graceful fallback to login page

## Best Practices

### 1. Component Integration
```tsx
// Add session warning to critical forms
import { SessionWarningBanner } from '@/components/ui/session-status'

function CriticalForm() {
  return (
    <div>
      <SessionWarningBanner />
      <form>...</form>
    </div>
  )
}
```

### 2. API Calls
```tsx
// Use authenticated fetch for all API calls
import { useAuthenticatedFetch } from '@/hooks/useSessionValidation'

function DataComponent() {
  const { authenticatedFetch } = useAuthenticatedFetch()
  
  const loadData = async () => {
    try {
      const data = await authenticatedFetch('/api/data')
      setData(data)
    } catch (error) {
      // Session validation handled automatically
      console.error('Failed to load data:', error)
    }
  }
}
```

### 3. Critical Operations
```tsx
// Use session validation for important operations
import { useCriticalPageSessionCheck } from '@/hooks/useSessionValidation'

function PaymentPage() {
  const { isSessionValid, forceCheck } = useCriticalPageSessionCheck(60000) // 1 minute
  
  const handlePayment = async () => {
    await forceCheck() // Validate before critical operation
    if (!isSessionValid) {
      toast.error('Please log in again to continue')
      return
    }
    // Proceed with payment
  }
}
```

## Troubleshooting

### Common Issues

1. **Validation Not Working**
   - Check if SessionValidationProvider is properly wrapped
   - Verify NextAuth session is available
   - Check browser console for errors

2. **Too Frequent Validations**
   - Increase `validationInterval` prop
   - Disable `enableAutoValidation` for specific pages

3. **False Positive Logouts**
   - Check API endpoint responses
   - Verify session endpoint is working
   - Check network connectivity

### Debug Mode

Enable debug logging by adding to your component:

```tsx
const { isValidating, lastValidation } = useSessionValidation()

console.log('Session validation status:', {
  isValidating,
  lastValidation,
  isSessionValid
})
```

## Performance Considerations

- Validation requests are lightweight and cached
- User activity tracking is debounced
- Automatic validation pauses when user is inactive
- No validation on public routes
- Minimal impact on application performance
