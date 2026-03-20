"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useExtracted } from "next-intl";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export function LoginForm() {
  const t = useExtracted('auth')

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.email({
        email,
        password,
      });
      // Force page reload to ensure session is picked up
      window.location.href = "/dashboard/chat";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card lg:w-120">
      <h2>{t("Login to your account")}</h2>
      <p className="text-primary-text/50 my-5 text-sm">{t("Enter your information below to access your account")}</p>
      <div className="flex flex-col gap-3 mb-4">
        <button className="btn btn-border">
          {t('Login with Google')}
        </button>
        <button className="btn btn-border">
          {t('Login with Apple')}
        </button>
        <button className="btn btn-border">
          {t('Login with Facebook')}
        </button>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 border-t border-border"></div>
        <span className=" text-subtle">
          {t("Or continue with")}
        </span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block  font-medium mb-2">
            {t('Email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="mail@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full btn btn-border text-left"
            required
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label htmlFor="password" className=" font-medium mb-2">
              {t('Password')}
            </label>
            <Link href={'/recover-account'} className=" text-left font-medium mb-2 hover:underline">
              {t('Forgot your password?')}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full btn btn-border text-left"
              required
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
        </div>

        {error && (
          <div className="text-red-400 ">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-reverse disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('Logging in...') : t('Login')}
        </button>
        <div className="flex justify-center text-primary-text/80">
          <label htmlFor="password" className=" mb-2 pr-1">
            {t(`Don't have an account?`)}
          </label>
          <Link href={'/register'} className="text-left underline mb-2 hover:text-primary-text">
            {t('Sign up')}
          </Link>
        </div>
      </form>
    </div>
  );
}
