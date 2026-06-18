import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { projectsX } from "@/data";
import { TermSheetProvider } from "@/components/term-sheet";
import { ProjectXList } from "@/components/project-x-list";

describe("ProjectXList", () => {
  it("renders project names", () => {
    render(
      <TermSheetProvider>
        <ProjectXList projects={projectsX} />
      </TermSheetProvider>,
    );
    // Each card's own text self-references its name (now a tappable projectx ref), so the name
    // appears in both the <summary> and a button — assert presence rather than uniqueness.
    expect(screen.getAllByText("Bojové hejno").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paprsek smrti").length).toBeGreaterThan(0);
  });
});
