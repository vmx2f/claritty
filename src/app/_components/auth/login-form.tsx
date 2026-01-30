"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useExtracted } from "next-intl";
import Link from "next/link";

export function LoginForm() {
  const t = useExtracted('auth')

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-sm w-full mx-auto p-6 rounded-xl bg-card/50 border border-subtle drop-shadow-sm">
      <h2 className="font-bold mb-2">{t("Login to your account")}</h2>
      <p className="text-primary-text/50 mb-5">{t("Enter your information below to access your account")}</p>
      <div className="flex flex-col gap-3 mb-4">
        <button className="text-primary-text w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card hover:bg-subtle/80">
          {t('Login with Google')}
        </button>
        <button className="text-primary-text  w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card hover:bg-subtle/80">
          {t('Login with Apple')}
        </button>
        <button className="text-primary-text  w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card hover:bg-subtle/80">
          {t('Login with Facebook')}
        </button>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 border-t border-neutral-700"></div>
        <span className=" text-neutral-400 whitespace-nowrap">
          Or continue with
        </span>
        <div className="flex-1 border-t border-neutral-700"></div>
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
            className=" w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card"
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className=" w-full px-3 py-2 border border-subtle rounded-lg focus:outline-none transition-all duration-300 focus:ring-3 focus:ring-subtle/90 bg-card"
            required
          />
        </div>

        {error && (
          <div className="text-red-500 ">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full  py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('Logging in...') : t('Login')}
        </button>
        <div className="flex justify-center text-primary-text/80">
          <label htmlFor="password" className=" mb-2 pr-1">
            {t(`Don't have an account?`)}
          </label>
          <Link href={'/register'} className=" text-left underline mb-2 hover:text-primary-text">
            {t('Sign up')}
          </Link>
        </div>
      </form>
    </div>
  );
}
