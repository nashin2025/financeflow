import { describe, it, expect, vi } from "vitest";
import {
  cn,
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
  formatDate,
  formatDateLong,
  formatTime,
  getRelativeTimeString,
  getInitials,
  truncate,
  generateId,
  categoryColors,
  categoryIcons,
} from "./utils";

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", null, undefined, "class2")).toBe("class1 class2");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500"); // tailwind merge
  });
});

describe("formatCurrency", () => {
  it("should format currency with default MVR", () => {
    expect(formatCurrency(1000)).toMatch(/^MVR.1,000.00$/);
  });

  it("should format currency with specified currency", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
    expect(formatCurrency(1000, "EUR")).toBe("€1,000.00");
  });

  it("should handle decimals", () => {
    expect(formatCurrency(1234.56)).toBe("MVR" + String.fromCharCode(160) + "1,234.56");
  });

  it("should default to MVR for unknown currency", () => {
    expect(formatCurrency(1000, "UNKNOWN")).toBe("MVR" + String.fromCharCode(160) + "1,000.00");
  });
});

describe("formatCompactCurrency", () => {
  it("should format amounts under 1000", () => {
    expect(formatCompactCurrency(500)).toBe("Rf500.00");
  });

  it("should format amounts in thousands", () => {
    expect(formatCompactCurrency(1500)).toBe("Rf1.5K");
  });

  it("should format amounts in millions", () => {
    expect(formatCompactCurrency(1500000)).toBe("Rf1.5M");
  });
});

describe("formatPercentage", () => {
  it("should format positive percentages", () => {
    expect(formatPercentage(15.5)).toBe("15.5%");
  });

  it("should format negative percentages as absolute", () => {
    expect(formatPercentage(-10.2)).toBe("10.2%");
  });
});

describe("formatDate", () => {
  it("should format date string", () => {
    const date = new Date("2023-12-25");
    expect(formatDate(date)).toBe("Dec 25");
  });

  it("should format date object", () => {
    expect(formatDate("2023-12-25")).toBe("Dec 25");
  });
});

describe("formatDateLong", () => {
  it("should format date with full details", () => {
    const date = new Date("2023-12-25");
    expect(formatDateLong(date)).toBe("December 25, 2023");
  });
});

describe("formatTime", () => {
  it("should format time in 12-hour format", () => {
    const date = new Date("2023-12-25T14:30:00");
    expect(formatTime(date)).toMatch(/^2:30 PM$/i);
  });
});

describe("getRelativeTimeString", () => {
  beforeEach(() => {
    // Mock current time
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'Just now' for very recent times", () => {
    const now = new Date("2024-01-01T11:59:30");
    expect(getRelativeTimeString(now)).toBe("Just now");
  });

  it("should return minutes ago", () => {
    const past = new Date("2024-01-01T11:30:00");
    expect(getRelativeTimeString(past)).toBe("30m ago");
  });

  it("should return hours ago", () => {
    const past = new Date("2024-01-01T08:00:00");
    expect(getRelativeTimeString(past)).toBe("4h ago");
  });

  it("should return 'Yesterday'", () => {
    const yesterday = new Date("2023-12-31T12:00:00");
    expect(getRelativeTimeString(yesterday)).toBe("Yesterday");
  });

  it("should return days ago", () => {
    const past = new Date("2023-12-29T12:00:00");
    expect(getRelativeTimeString(past)).toBe("3d ago");
  });

  it("should return formatted date for older dates", () => {
    const old = new Date("2023-12-20T12:00:00");
    expect(getRelativeTimeString(old)).toBe("Dec 20");
  });
});

describe("getInitials", () => {
  it("should return uppercase initials", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should handle single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should limit to 2 characters", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("should handle empty string", () => {
    expect(getInitials("")).toBe("");
  });
});

describe("truncate", () => {
  it("should not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("should truncate long strings", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
  });

  it("should handle exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("generateId", () => {
  it("should generate a string id", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique ids", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe("categoryColors", () => {
  it("should have color for housing", () => {
    expect(categoryColors.housing).toBe("#6366F1");
  });

  it("should have colors for all categories", () => {
    expect(Object.keys(categoryColors)).toContain("groceries");
    expect(Object.keys(categoryColors)).toContain("salary");
  });
});

describe("categoryIcons", () => {
  it("should have icon for housing", () => {
    expect(categoryIcons.housing).toBe("🏠");
  });

  it("should have icons for all categories", () => {
    expect(Object.keys(categoryIcons)).toContain("groceries");
    expect(Object.keys(categoryIcons)).toContain("salary");
  });
});
