import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "pointer-events-none fixed inset-x-0 top-8 z-[100] flex flex-col items-center justify-start gap-3 px-4",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-[min(320px,100%)] items-start justify-between space-x-3 overflow-hidden rounded-md border p-4 pr-6 text-sm backdrop-blur-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-6",
  {
    variants: {
      variant: {
        default:
          "border-border/60 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--card))] to-[hsl(var(--muted))] text-foreground",
        destructive:
          "border-[hsl(var(--destructive))/60] bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
        success:
          "border-[hsl(var(--success))/55] bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
        warning:
          "border-[hsl(var(--warning))/55] bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
        info:
          "border-[hsl(var(--info))/55] bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-7 shrink-0 items-center justify-center rounded-md border border-border/60 bg-transparent px-2.5 text-[11px] font-medium uppercase tracking-wide text-foreground/70 ring-offset-background transition-colors hover:bg-[hsl(var(--accent))]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-[hsl(var(--destructive))/60] group-[.destructive]:text-[hsl(var(--destructive-foreground))] group-[.destructive]:hover:bg-[hsl(var(--destructive-foreground))]/10 group-[.destructive]:focus-visible:ring-[hsl(var(--destructive))]/40",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1.5 top-1.5 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40 group-hover:opacity-100 group-[.destructive]:text-[hsl(var(--destructive-foreground))] group-[.destructive]:hover:text-[hsl(var(--destructive-foreground))] group-[.destructive]:focus-visible:ring-[hsl(var(--destructive))]/40",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
