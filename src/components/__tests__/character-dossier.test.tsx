import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { characters } from "@/data";
import { CharacterDossier } from "@/components/character-dossier";
import { TermSheetProvider } from "@/components/term-sheet";

function fixture(id: string) {
  const c = characters.find((x) => x.id === id);
  if (!c) throw new Error(`fixture ${id} missing`);
  return c;
}

describe("CharacterDossier", () => {
  it("renders the character header and abilities", () => {
    render(
      <TermSheetProvider>
        <CharacterDossier character={fixture("agentka")} />
      </TermSheetProvider>,
    );
    expect(screen.getByRole("heading", { name: "Agentka" })).toBeInTheDocument();
    expect(screen.getByText("Důstojník")).toBeInTheDocument();
    expect(screen.getByText("Granáty s nervovým plynem")).toBeInTheDocument(); // reveal ability
  });

  it("renders agendas (title + points) and edge cases", () => {
    render(
      <TermSheetProvider>
        <CharacterDossier character={fixture("agentka")} />
      </TermSheetProvider>,
    );
    expect(screen.getByText("ZAMETENÍ DŮKAZŮ")).toBeInTheDocument();
    // "Entropický přízrak" is now a tappable Project X ref (split out), so assert on the
    // resilient prefix of this edge case rather than the full contiguous string.
    expect(screen.getByText(/Mina nereaguje na/)).toBeInTheDocument();
  });
});
