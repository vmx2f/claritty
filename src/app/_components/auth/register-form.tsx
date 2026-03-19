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

  const passwordChecks = {
    minLength: password.length >= 8,
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
    <div className="card">
      <h2>{t("Create your account")}</h2>
      <p className="text-primary-text/50 my-5 text-sm">
        {t("Enter your information below to create your account")}
      </p>
      <div className="flex flex-col gap-3 mb-4">
        <button className="btn btn-border">
          {t("Sign up with Google")}
        </button>
        <button className="btn btn-border">
          {t("Sign up with Apple")}
        </button>
        <button className="btn btn-border">
          {t("Sign up with Facebook")}
        </button>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 border-t border-border"></div>
        <span className=" text-subtle">
          {t("Or continue with")}
        </span>
        <div className="flex-1 border-t border-border"></div>
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
            className="w-full btn btn-border text-left"
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
            className="w-full btn btn-border text-left"
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
              className="w-full btn btn-border text-left"
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
            <div className="mt-2 space-y-1">
              <p className="text-xs text-subtle mb-2">{t('Password must contain:')}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${passwordChecks.minLength ? "text-success" : "text-subtle"}`}>
                    {passwordChecks.minLength ? "✓" : "✗"}
                  </span>
                  <span className={`text-xs ${passwordChecks.minLength ? "text-success" : "text-subtle"}`}>
                    {t('At least 8 characters')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${passwordChecks.hasLetter ? "text-success" : "text-subtle"}`}>
                    {passwordChecks.hasLetter ? "✓" : "✗"}
                  </span>
                  <span className={`text-xs ${passwordChecks.hasLetter ? "text-success" : "text-subtle"}`}>
                    {t('At least one letter')}
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
          className="w-full btn btn-reverse disabled:opacity-50 disabled:cursor-not-allowed"
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
