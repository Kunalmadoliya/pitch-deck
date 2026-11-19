import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownAnswer } from "../markdown-answer";

const citation = { n: 1, documentId: "d1", fileName: "leave-policy.pdf", pageNumber: 3, chunkIndex: 0 };

describe("MarkdownAnswer", () => {
  it("renders lists, bold text and nested bullets", () => {
    const html = renderToStaticMarkup(
      <MarkdownAnswer
        content={"The policy:\n\n1. **Eligibility**: All employees.\n\n2. **Types of Leave**:\n   - **Casual Leave (CL)**: 10 days.\n   - **Sick Leave**: combined with CL."}
      />,
    );
    expect(html).toContain("<ol");
    expect(html).toContain("<ul");
    expect(html).toContain("<strong");
    expect(html).toContain("Casual Leave (CL)");
    expect(html).not.toContain("**");
  });

  it("turns known [n] markers into citation pills and leaves unknown ones as text", () => {
    const html = renderToStaticMarkup(
      <MarkdownAnswer content={"Ten days of CL [1]. Unknown [7]."} citations={[citation]} />,
    );
    expect(html).toContain('aria-label="Source 1: leave-policy.pdf, page 3"');
    expect(html).toContain("[7]");
    expect(html).not.toContain("#cite-");
  });

  it("renders tables", () => {
    const html = renderToStaticMarkup(<MarkdownAnswer content={"| Leave | Days |\n|---|---|\n| CL | 10 |"} />);
    expect(html).toContain("<table");
    expect(html).toContain("<td");
  });
});
