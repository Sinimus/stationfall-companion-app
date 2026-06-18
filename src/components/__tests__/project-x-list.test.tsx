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
    expect(screen.getByText("Bojové hejno")).toBeInTheDocument();
    expect(screen.getByText("Paprsek smrti")).toBeInTheDocument();
  });
});
