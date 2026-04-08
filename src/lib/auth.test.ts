import { describe, it, expect } from "vitest";
import { validatePassword, validateEmail, getAccessCookieName, getRefreshCookieName } from "./auth";

describe("validatePassword", () => {
  it("should return error for password too short", () => {
    expect(validatePassword("1234567")).toBe("Password must be at least 8 characters");
  });

  it("should return error for password too long", () => {
    const longPassword = "a".repeat(129);
    expect(validatePassword(longPassword)).toBe("Password must be less than 128 characters");
  });

  it("should return error for missing uppercase", () => {
    expect(validatePassword("password123!")).toBe("Password must contain at least one uppercase letter");
  });

  it("should return error for missing lowercase", () => {
    expect(validatePassword("PASSWORD123!")).toBe("Password must contain at least one lowercase letter");
  });

  it("should return error for missing number", () => {
    expect(validatePassword("Password!")).toBe("Password must contain at least one number");
  });

  it("should return error for missing special character", () => {
    expect(validatePassword("Password123")).toBe("Password must contain at least one special character");
  });

  it("should return null for valid password", () => {
    expect(validatePassword("Password123!")).toBe(null);
  });
});

describe("validateEmail", () => {
  it("should return error for empty email", () => {
    expect(validateEmail("")).toBe("Email is required");
    expect(validateEmail("   ")).toBe("Email is required");
  });

  it("should return error for invalid format", () => {
    expect(validateEmail("invalid")).toBe("Invalid email format");
    expect(validateEmail("invalid@")).toBe("Invalid email format");
    expect(validateEmail("@invalid.com")).toBe("Invalid email format");
  });

  it("should return error for too long email", () => {
    const longEmail = "a".repeat(256) + "@example.com";
    expect(validateEmail(longEmail)).toBe("Email is too long");
  });

  it("should return null for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(null);
    expect(validateEmail("user.name+tag@domain.co.uk")).toBe(null);
  });
});

describe("getAccessCookieName", () => {
  it("should return development cookie name", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    
    expect(getAccessCookieName()).toBe("ff-access");
    
    process.env.NODE_ENV = originalEnv;
  });

  it("should return production cookie name", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    
    expect(getAccessCookieName()).toBe("__Host-ff-access");
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe("getRefreshCookieName", () => {
  it("should return development cookie name", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    
    expect(getRefreshCookieName()).toBe("ff-refresh");
    
    process.env.NODE_ENV = originalEnv;
  });

  it("should return production cookie name", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    
    expect(getRefreshCookieName()).toBe("__Host-ff-refresh");
    
    process.env.NODE_ENV = originalEnv;
  });
});
