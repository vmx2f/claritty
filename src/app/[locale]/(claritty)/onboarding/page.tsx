"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "@/i18n/navigation";
import {
  BuildingOfficeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useExtracted } from "next-intl";

export default function OnboardingPage() {
  const t = useExtracted();

  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createOrganization = useMutation(api.organizations.createOrganization);
  const userOrganizations = useQuery(api.organizations.getUserOrganizations);

  // Redirect to dashboard if user already has organizations
  useEffect(() => {
    if (userOrganizations && userOrganizations.length > 0) {
      router.push("/dashboard/chat");
    }
  }, [userOrganizations, router]);

  // Show loading state while checking organizations
  if (userOrganizations === undefined) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-text border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-text">
            {t(`Checking your organizations...`)}
          </p>
        </div>
      </div>
    );
  }

  // Don't render the form if user has organizations (will redirect)
  if (userOrganizations && userOrganizations.length > 0) {
    return null;
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsCreating(true);
    try {
      await createOrganization({
        name: orgName.trim(),
        description: "",
      });

      // Redirect to chat
      router.push("/dashboard/chat");
    } catch (error) {
      console.error("Failed to create organization:", error);
      alert("Failed to create organization. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-color/10 rounded-2xl mb-6">
            <SparklesIcon className="w-10 h-10 text-accent-color" />
          </div>
          <h1 className="text-4xl font-bold text-primary-text mb-3 tracking-tight">
            {t("Welcome to Claritty!")}
          </h1>
          <p className="text-lg text-secondary-text">
            {t(`Let's get started by creating your first organization`)}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-color/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <form onSubmit={handleCreateOrg} className="relative z-10 space-y-8">
            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-color text-main flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="text-sm font-medium text-primary-text">
                  {t(`Create Organization`)}
                </span>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-secondary-text" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-border text-secondary-text flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="text-sm text-secondary-text">
                  {t(`Start using dashboard`)}
                </span>
              </div>
            </div>

            {/* Input section */}
            <div className="space-y-2">
              <label
                htmlFor="orgName"
                className="block text-sm font-semibold text-primary-text mb-3"
              >
                Organization Name
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
                <input
                  id="orgName"
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter your organization name..."
                  className="w-full bg-main border-2 border-border rounded-xl pl-12 pr-4 py-4 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-accent-color transition-all text-lg"
                  autoFocus
                />
              </div>
              <p className="text-xs text-secondary-text mt-2 ml-1">
                This can be your company name, team name, or personal workspace
              </p>
            </div>

            {/* Benefits list */}
            <div className="bg-main/50 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary-text mb-4">
                What you&apos;ll get:
              </h3>
              {[
                "Manage orders and clients efficiently",
                "Track capital transactions in real-time",
                "Collaborate with team members",
                "Get instant notifications and updates",
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-accent-color shrink-0" />
                  <span className="text-sm text-secondary-text">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isCreating || !orgName.trim()}
              className="w-full bg-primary-text text-main py-4 rounded-xl font-bold text-lg hover:bg-text-hover transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-main border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-secondary-text mt-8">
          You can create additional organizations later from the dashboard
        </p>
      </div>
    </div>
  );
}
