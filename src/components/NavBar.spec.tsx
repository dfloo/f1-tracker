import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NavBar from "./NavBar";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NavBar", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders the brand link and all navigation links", () => {
    render(<NavBar />);

    expect(
      screen.getByRole("link", {
        name: /f1 tracker/i,
      }),
    ).toHaveAttribute("href", "/");

    expect(screen.getByRole("link", { name: "Drivers" })).toHaveAttribute(
      "href",
      "/drivers",
    );
    expect(screen.getByRole("link", { name: "Teams" })).toHaveAttribute(
      "href",
      "/teams",
    );
    expect(screen.getByRole("link", { name: "Races" })).toHaveAttribute(
      "href",
      "/races",
    );
    expect(
      screen.getByRole("link", { name: "Championships" }),
    ).toHaveAttribute("href", "/championships");
  });

  it("marks a link as active when pathname matches exactly", () => {
    mockUsePathname.mockReturnValue("/teams");

    render(<NavBar />);

    const activeLink = screen.getByRole("link", { name: "Teams" });
    const inactiveLink = screen.getByRole("link", { name: "Drivers" });

    expect(activeLink).toHaveStyle({
      color: "var(--f1-red)",
    });
    expect(activeLink).toHaveClass("text-foreground");

    expect(inactiveLink).toHaveClass("text-muted");
    expect(inactiveLink).not.toHaveStyle({
      borderBottom: "2px solid var(--f1-red)",
    });
  });

  it("marks a link as active for nested routes", () => {
    mockUsePathname.mockReturnValue("/drivers/44");

    render(<NavBar />);

    const activeLink = screen.getByRole("link", { name: "Drivers" });
    const inactiveLink = screen.getByRole("link", { name: "Races" });

    expect(activeLink).toHaveStyle({
      color: "var(--f1-red)",
    });
    expect(activeLink).toHaveClass("text-foreground");
    expect(inactiveLink).toHaveClass("text-muted");
  });
});
