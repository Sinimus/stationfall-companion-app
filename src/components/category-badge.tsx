import { CATEGORY_BG_CLASS, CATEGORY_LABEL, CATEGORY_ICON, type AbilityCategory } from "@/lib/categories";

/** Barevný štítek kategorie schopnosti: ikona + barva + text (ikona je doplněk, ne náhrada). */
export function CategoryBadge({
  category,
  className = "",
}: {
  category: AbilityCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-white ${CATEGORY_BG_CLASS[category]} ${className}`}
    >
      <Icon className="size-3" aria-hidden />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
