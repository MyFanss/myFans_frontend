"use client";

import { useState, useRef } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TipCreatorModal } from "./TipCreatorModal";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import type { Creator } from "@/types/api";

interface TipButtonProps {
  creator: Creator;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function TipButton({
  creator,
  variant = "outline",
  size = "md",
  showText = true,
}: TipButtonProps) {
  const { data: user } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Don't show tip button for own profile or when not authenticated
  if (!user || user.id === creator.id || creator.id === user.id) {
    return null;
  }

  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2",
  }[size];

  return (
    <>
      <Button
        ref={buttonRef}
        variant={variant}
        className={`inline-flex items-center gap-1.5 ${sizeClass}`}
        onClick={() => setIsModalOpen(true)}
        aria-label={`Tip ${creator.name}`}
      >
        <Gift className="size-4" />
        {showText && <span>Tip</span>}
      </Button>

      <TipCreatorModal
        creator={creator}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
