import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  iconClassName?: string;
};

export function FavoriteButton({
  isFavorite,
  onToggle,
  className,
  iconClassName = "size-5",
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn("cursor-pointer rounded-full bg-white p-2 hover:bg-white/90", className)}
    >
      <Heart
        aria-hidden
        className={cn(iconClassName, isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")}
      />
    </button>
  );
}
