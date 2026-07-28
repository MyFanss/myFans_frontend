import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedFilters } from "@/components/feed/FeedFilters";

describe("FeedFilters", () => {
  it("renders all filter options", () => {
    const handleFilterChange = vi.fn();
    render(
      <FeedFilters activeFilter="all" onFilterChange={handleFilterChange} />
    );

    expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /media/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /text/i })).toBeInTheDocument();
  });

  it("highlights active filter", () => {
    const handleFilterChange = vi.fn();
    render(
      <FeedFilters activeFilter="media" onFilterChange={handleFilterChange} />
    );

    const mediaTab = screen.getByRole("tab", { name: /media/i });
    expect(mediaTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /all/i })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onFilterChange when filter is clicked", async () => {
    const user = userEvent.setup();
    const handleFilterChange = vi.fn();
    render(
      <FeedFilters activeFilter="all" onFilterChange={handleFilterChange} />
    );

    await user.click(screen.getByRole("tab", { name: /text/i }));
    expect(handleFilterChange).toHaveBeenCalledWith("text");
  });

  it("should be sticky positioned on mobile", () => {
    const handleFilterChange = vi.fn();
    const { container } = render(
      <FeedFilters activeFilter="all" onFilterChange={handleFilterChange} />
    );

    const filterDiv = container.querySelector("[role='tablist']");
    expect(filterDiv).toHaveClass("sticky", "top-0");
  });
});
