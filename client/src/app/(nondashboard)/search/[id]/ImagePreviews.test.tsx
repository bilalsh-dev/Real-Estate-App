import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ImagePreviews } from "./ImagePreviews";

const images = [
  "https://example.com/1.jpg",
  "https://example.com/2.jpg",
  "https://example.com/3.jpg",
];

function visibleAlt() {
  return screen.getByRole("img", { hidden: false }).getAttribute("alt");
}

describe("ImagePreviews", () => {
  it("wraps around in both directions", async () => {
    const user = userEvent.setup();
    render(<ImagePreviews images={images} name="Loft" />);
    expect(visibleAlt()).toBe("Loft photo 1 of 3");

    await user.click(screen.getByRole("button", { name: "Previous image" }));
    expect(visibleAlt()).toBe("Loft photo 3 of 3");

    await user.click(screen.getByRole("button", { name: "Next image" }));
    expect(visibleAlt()).toBe("Loft photo 1 of 3");

    await user.click(screen.getByRole("button", { name: "Next image" }));
    await user.click(screen.getByRole("button", { name: "Next image" }));
    await user.click(screen.getByRole("button", { name: "Next image" }));
    expect(visibleAlt()).toBe("Loft photo 1 of 3");
  });

  it("shows a placeholder without navigation when there are no photos", () => {
    render(<ImagePreviews images={[]} name="Loft" />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Loft photo 1 of 1");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
