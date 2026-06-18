import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { characters } from "@/data";
import { CharacterDossier } from "@/components/character-dossier";

function fixture(id: string) {
  const c = characters.find((x) => x.id === id);
  if (!c) throw new Error(`fixture ${id} missing`);
  return c;
}

describe("CharacterDossier", () => {
  it("renders the character header and abilities", () => {
    render(<CharacterDossier character={fixture("agentka")} />);
    expect(screen.getByRole("heading", { name: "Agentka" })).toBeInTheDocument();
    expect(screen.getByText("Důstojník")).toBeInTheDocument();
    expect(screen.getByText("Granáty s nervovým plynem")).toBeInTheDocument(); // reveal ability
  });

  it("renders agendas (title + points) and edge cases", () => {
    render(<CharacterDossier character={fixture("agentka")} />);
    expect(screen.getByText("ZAMETENÍ DŮKAZŮ")).toBeInTheDocument();
    expect(screen.getByText(/Mina nereaguje na Entropický přízrak/)).toBeInTheDocument();
  });
});
