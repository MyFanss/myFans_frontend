"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertDialogContextValue {
  onOpenChange?: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({});

function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <AlertDialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute inset-0 bg-black/50"
          onClick={() => onOpenChange?.(false)}
        />
        {children}
      </div>
    </AlertDialogContext.Provider>
  );
}

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alertdialog"
    className={cn(
      "relative z-10 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-2 text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

function AlertDialogCancel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => onOpenChange?.(false)}
      {...props}
    >
      {children}
    </Button>
  );
}

function AlertDialogAction({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <Button
      type="button"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          onOpenChange?.(false);
        }
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};
