"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastAction, // Import ToastAction as a component
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} id={id}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action} {/* action is already a ReactNode (ToastAction component) */}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}