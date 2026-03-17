"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useExtracted } from "next-intl";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useExtracted("auth");

  // More permissive password validation checks
  const passwordChecks = {
    minLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every((check) => check);

  const getPasswordStrength = () => {
    const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
    if (passedChecks === 1) return { text: "Fair", color: "text-yellow-500" };
    if (passedChecks === 2) return { text: "Good", color: "text-green-500" };
    return { text: "Weak", color: "text-red-500" };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate password before submission
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      setIsLoading(false);
      return;
    }

    try {
      await authClient.signUp.email({
        email,
        password,
        name,
      });
      // Redirect to chat after successful registration
      window.location.href = "/dashboard/chat";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-sm w-full mx-auto p-6 rounded-xl bg-card/50 border border-subtle drop-shadow-sm">
      <h2 className="font-bold mb-2">{t("Create your account")}</h2>
      <p className="text-primary-text/50  mb-5">
        {t("Enter your information below to create your account")}
      </p>
      <div className="flex flex-col gap-3 mb-4">
        <button className="text-primary-text  w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card hover:bg-subtle/80">
          {t("Sign up with Google")}
        </button>
        <button className="text-primary-text  w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card hover:bg-subtle/80">
          {t("Sign up with Apple")}
        </button>
        <button className="text-primary-text  w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card hover:bg-subtle/80">
          {t("Sign up with Facebook")}
        </button>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 border-t border-neutral-700"></div>
        <span className=" text-neutral-400 whitespace-nowrap">
          {t("Or continue with")}
        </span>
        <div className="flex-1 border-t border-neutral-700"></div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="name" className="block  font-medium mb-2">
            {t("Name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className=" w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block  font-medium mb-2">
            {t("Email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com"
            className=" w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block  font-medium mb-2">
            {t("Password")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text transition-colors p-0"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Simplified password requirements */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-subtle">Password strength:</span>
              <span
                className={`text-xs font-medium ${password ? getPasswordStrength().color : "text-gray-400"}`}
              >
                {password ? getPasswordStrength().text : "Enter password"}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  !password
                    ? "bg-gray-300 dark:bg-gray-600 w-0"
                    : getPasswordStrength().text === "Weak"
                      ? "bg-red-500 w-1/3"
                      : getPasswordStrength().text === "Fair"
                        ? "bg-yellow-500 w-2/3"
                        : "bg-green-500 w-full"
                }`}
              />
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-subtle mb-2">Password must contain:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${passwordChecks.minLength ? "text-success" : "text-gray-400"}`}
                  >
                    {passwordChecks.minLength ? "✓" : "○"}
                  </span>
                  <span
                    className={`text-xs ${passwordChecks.minLength ? "text-success" : "text-gray-400"}`}
                  >
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${passwordChecks.hasLetter ? "text-success" : "text-gray-400"}`}
                  >
                    {passwordChecks.hasLetter ? "✓" : "○"}
                  </span>
                  <span
                    className={`text-xs ${passwordChecks.hasLetter ? "text-success" : "text-gray-400"}`}
                  >
                    At least one letter
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="text-error">{error}</div>}

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid}
          className="w-full  py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t("Creating account...") : t("Create account")}
        </button>
        <div className="flex justify-center text-primary-text/80">
          <label htmlFor="password" className=" mb-2 pr-1">
            {t(`Already have an account?`)}
          </label>
          <Link
            href={"/login"}
            className=" text-left underline mb-2 hover:text-primary-text"
          >
            {t("Sign in")}
          </Link>
        </div>
      </form>
    </div>
  );
}
