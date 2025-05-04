import { MantineColorScheme } from '@mantine/core'
import { toast as reactToastifyToast, Bounce, type ToastOptions } from 'react-toastify'

// getToastOptions returns the toast options based on the color scheme.
export const getToastOptions = (colorScheme: MantineColorScheme): ToastOptions => {
  return {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: colorScheme === 'light' ? 'light' : 'dark',
    transition: Bounce
  }
}

// A good abstraction is an abstraction that hides a lower layer of abstraction!
// Prefer to use this instead of `react-toastify` directly so it's one less
// import and an easier type to understand.
/**
 * A Toast is a message that appears on the screen to tell the user something
 * without annoying them. It's a notification!
 *
 * @param action The toast will show after this action is complete.
 */
export const toast = <T>(
  action: Promise<any>,
  pendingMessage: string,
  successMessage: string,
  errorMessage: string,
  computedColorScheme: MantineColorScheme,
): Promise<T> => {
  return reactToastifyToast.promise(
    action,
    { pending: pendingMessage, success: successMessage, error: errorMessage },
    getToastOptions(computedColorScheme),
  ) as Promise<T>
}
