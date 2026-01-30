'use client';

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { BuildingOfficeIcon, UsersIcon, BellIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function DashboardHome() {
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);

  return (
      <div className="space-y-6 px-4 py-4">
        {/* Welcome Section */}
        <div className="bg-card rounded-lg p-6 shadow-custom">
          <h1 className="text-2xl font-bold text-primary-text mb-2">
            Welcome to Claritty
          </h1>
          <p className="text-secondary-text">
            Manage your organizations and collaborate with your team efficiently.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-custom">
            <div className="flex items-center">
              <div className="p-3 bg-accent-color/10 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-accent-color" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-secondary-text">Organizations</p>
                <p className="text-2xl font-semibold text-primary-text">
                  {organizations?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-custom">
            <div className="flex items-center">
              <div className="p-3 bg-info/10 rounded-lg">
                <UsersIcon className="w-6 h-6 text-info" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-secondary-text">Team Members</p>
                <p className="text-2xl font-semibold text-primary-text">
                  {organizations?.reduce((acc, org) => acc + (org.members?.length || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-custom">
            <div className="flex items-center">
              <div className="p-3 bg-warning/10 rounded-lg">
                <BellIcon className="w-6 h-6 text-warning" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-secondary-text">Unread Notifications</p>
                <p className="text-2xl font-semibold text-primary-text">
                  {unreadCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Section */}
        <div className="bg-card rounded-lg shadow-custom">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary-text">Your Organizations</h2>
              <Link
                href="/(claritty)/dashboard/organizations/new"
                className="flex items-center px-4 py-2 bg-accent-color text-main rounded-lg hover:bg-accent-color/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Organization
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {organizations && organizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizations.map((org) => (
                  <Link
                    key={org._id}
                    href={`/(claritty)/dashboard/organizations/${org._id}`}
                    className="p-4 border border-border rounded-lg hover:bg-hover transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-primary-text">{org.name}</h3>
                        <p className="text-sm text-secondary-text mt-1">
                          {org.description || "No description"}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-secondary-text">
                            Role: <span className="font-medium">{org.userRole}</span>
                          </span>
                          <span className="text-xs text-secondary-text">
                            Members: <span className="font-medium">{org.members?.length || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="w-12 h-12 text-secondary-text mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary-text mb-2">
                  No organizations yet
                </h3>
                <p className="text-secondary-text mb-4">
                  Create your first organization to start collaborating with your team.
                </p>
                <Link
                  href="/(claritty)/dashboard/organizations/new"
                  className="inline-flex items-center px-4 py-2 bg-accent-color text-main rounded-lg hover:bg-accent-color/90 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Organization
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
