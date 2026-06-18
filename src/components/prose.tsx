import type { ReactNode } from "react";

/**
 * Čtecí blok pro víceřádkový / vícevětý text. Omezí šířku řádku (measure ≈ 65 znaků)
 * a přidá štědré řádkování, aby dlouhé definice/odpovědi netvořily slitý „block of text".
 */
export function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`measure leading-relaxed ${className}`}>{children}</div>;
}
