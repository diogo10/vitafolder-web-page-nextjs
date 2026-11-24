import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "ada@example.com",
      password: "correct horse battery staple",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: "ada@example.com",
        password: "correct horse battery staple",
      });
    }
  });

  it("trims the email but leaves the password untouched", () => {
    const result = loginSchema.parse({ email: "  ada@example.com  ", password: " pass " });
    expect(result.email).toBe("ada@example.com");
    expect(result.password).toBe(" pass ");
  });

  it("rejects a missing email", () => {
    const result = loginSchema.safeParse({ email: "", password: "secret" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/enter your email/i);
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/valid email/i);
    }
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/enter your password/i);
    }
  });
});

describe("signupSchema", () => {
  it("accepts a valid email and password", () => {
    const result = signupSchema.safeParse({
      email: "ada@example.com",
      password: "correct horse battery staple",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: "ada@example.com",
        password: "correct horse battery staple",
      });
    }
  });

  it("trims the email but leaves the password untouched", () => {
    const result = signupSchema.parse({ email: "  ada@example.com  ", password: " pass1234 " });
    expect(result.email).toBe("ada@example.com");
    expect(result.password).toBe(" pass1234 ");
  });

  it("rejects a missing or invalid email", () => {
    for (const email of ["", "not-an-email"]) {
      const result = signupSchema.safeParse({ email, password: "password123" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/email/i);
      }
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({ email: "ada@example.com", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/at least 8 characters/i);
    }
  });

  it("caps the email length at 254 characters", () => {
    const email = `${"a".repeat(243)}@example.com`;
    expect(email).toHaveLength(255);
    const result = signupSchema.safeParse({ email, password: "password123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/254 characters or fewer/i);
    }
  });

  it("caps the password length at 72 characters", () => {
    const result = signupSchema.safeParse({
      email: "ada@example.com",
      password: "a".repeat(73),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/72 characters or fewer/i);
    }
  });
});
