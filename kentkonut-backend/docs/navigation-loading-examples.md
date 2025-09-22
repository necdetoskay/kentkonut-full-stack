# Navigation Loading System - Usage Examples

## Overview

The global navigation loading system provides visual feedback during page transitions and async operations. It consists of several components and hooks that work together to create a seamless user experience.

## Components

### 1. NavigationLoading

The main loading indicator component with different variants:

```tsx
// Top progress bar (default)
<NavigationLoading variant="bar" />

// Full overlay with spinner
<NavigationLoading variant="overlay" />

// Minimal progress bar
<NavigationLoading variant="minimal" />
```

### 2. LoadingLink

A wrapper around Next.js Link that automatically triggers loading states:

```tsx
import { LoadingLink } from "@/components/ui/loading-link"

// Basic usage
<LoadingLink href="/dashboard/users">
  <Button>Go to Users</Button>
</LoadingLink>

// Button-style link
<LoadingButton href="/dashboard/settings" variant="outline">
  Settings
</LoadingButton>
```

## Hooks

### 1. useNavigationLoading

For programmatic navigation with loading states:

```tsx
import { useNavigationLoading } from "@/hooks/useNavigationLoading"

function MyComponent() {
  const { navigateWithLoading, isLoading } = useNavigationLoading()

  const handleClick = async () => {
    await navigateWithLoading('/dashboard/users')
  }

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      Navigate to Users
    </Button>
  )
}
```

### 2. useAsyncLoading

For showing loading during async operations:

```tsx
import { useAsyncLoading } from "@/hooks/useNavigationLoading"

function DataComponent() {
  const { executeWithLoading } = useAsyncLoading()

  const handleSubmit = async (data) => {
    await executeWithLoading(
      () => fetch('/api/data', { method: 'POST', body: JSON.stringify(data) }),
      {
        onSuccess: () => toast.success('Data saved!'),
        onError: (error) => toast.error(error.message)
      }
    )
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## Manual Control

You can manually control the loading state:

```tsx
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext"

function CustomComponent() {
  const { startLoading, stopLoading, isLoading } = useNavigationLoading()

  const handleLongOperation = async () => {
    startLoading()
    try {
      await someAsyncOperation()
    } finally {
      stopLoading()
    }
  }

  return (
    <Button onClick={handleLongOperation} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Start Operation'}
    </Button>
  )
}
```

## Configuration

The loading system is configured in the root layout:

```tsx
// app/layout.tsx
import { NavigationLoadingProvider } from "@/contexts/NavigationLoadingContext"
import { NavigationLoading } from "@/components/ui/navigation-loading"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NavigationLoadingProvider>
          <NavigationLoading variant="bar" />
          {children}
        </NavigationLoadingProvider>
      </body>
    </html>
  )
}
```

## Best Practices

1. **Use LoadingLink for navigation**: Replace regular Link components with LoadingLink
2. **Wrap router calls**: Use navigateWithLoading() instead of router.push()
3. **Show loading for async operations**: Use executeWithLoading() for API calls
4. **Avoid multiple loading states**: The global loading indicator should be the primary feedback mechanism
5. **Handle errors gracefully**: Always include error handling to stop loading on failures

## Troubleshooting

- **Loading doesn't stop**: Make sure all async operations have proper error handling
- **Multiple loading indicators**: Check that you're not mixing global and local loading states
- **Performance issues**: The loading system is optimized, but avoid triggering it unnecessarily
