"use client";

import { useState, useEffect } from "react";
import {
    BellIcon,
    EnvelopeIcon,
    CheckIcon,
    XMarkIcon,
    TrashIcon,
    BuildingOfficeIcon,
    ClockIcon,
    CheckCircleIcon,
    TicketIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";

export default function NotificationsPage() {
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const session = await authClient.getSession();
            if (session.data?.user?.email) {
                setUserEmail(session.data.user.email);
            }
        };
        fetchUser();
    }, []);

    // Queries
    const notifications = useQuery(api.notifications.getUserNotifications);
    const myInvitations = useQuery(api.members.getMyInvitations, userEmail ? { email: userEmail } : "skip");

    // Mutations
    const markAsRead = useMutation(api.notifications.markAsRead);
    const deleteNotification = useMutation(api.notifications.deleteNotification);
    const acceptInvitation = useMutation(api.members.acceptInvitation);

    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleAcceptInvite = async (inviteId: any) => {
        setIsProcessing(inviteId);
        try {
            await acceptInvitation({ invitationId: inviteId });
            // Redirect or show success
            alert("Invitation accepted! You are now a member of the organization.");
        } catch (error) {
            console.error("Failed to accept invite:", error);
            alert("Failed to accept invitation.");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary-text tracking-tight flex items-center gap-3">
                        <BellIcon className="w-8 h-8 text-accent-color" />
                        Notifications
                    </h1>
                    <p className="text-secondary-text mt-1">Stay updated with your team and organization.</p>
                </div>
            </div>

            {/* Invitations Section */}
            {myInvitations && myInvitations.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-primary-text flex items-center gap-2">
                        <TicketIcon className="w-5 h-5 text-warning" />
                        Organization Invitations
                    </h2>
                    <div className="grid gap-4">
                        {myInvitations.map((invite) => (
                            <div key={invite._id} className="bg-card border-2 border-warning/20 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-warning/40">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center text-warning shrink-0">
                                        <BuildingOfficeIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-primary-text">
                                            Invite to join <span className="text-accent-color">{invite.organizationName}</span>
                                        </h3>
                                        <p className="text-sm text-secondary-text">
                                            You've been invited as a <span className="font-medium capitalize">{invite.role}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        disabled={isProcessing === invite._id}
                                        onClick={() => handleAcceptInvite(invite._id)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-text text-main px-6 py-2 rounded-xl font-bold hover:bg-text-hover transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isProcessing === invite._id ? (
                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckIcon className="w-5 h-5" />
                                                Accept
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* General Notifications Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-primary-text flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-accent-color" />
                    Recent Activity
                </h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
                    {notifications?.map((notif) => (
                        <div key={notif._id} className={`p-6 flex items-start gap-4 hover:bg-hover transition-colors ${!notif.isRead ? 'bg-accent-color/5' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type.includes('accepted') ? 'bg-success/10 text-success' :
                                    notif.type.includes('added') ? 'bg-accent-color/10 text-accent-color' :
                                        'bg-secondary-text/10 text-secondary-text'
                                }`}>
                                {notif.type.includes('invitation') ? <EnvelopeIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-semibold truncate ${!notif.isRead ? 'text-primary-text' : 'text-secondary-text'}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-xs text-secondary-text flex items-center gap-1 whitespace-nowrap">
                                        <ClockIcon className="w-3 h-3" />
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-text line-clamp-2">{notif.message}</p>
                                <div className="mt-3 flex items-center gap-4">
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => markAsRead({ notificationId: notif._id })}
                                            className="text-xs font-bold text-accent-color hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification({ notificationId: notif._id })}
                                        className="text-xs font-bold text-error/60 hover:text-error hover:underline flex items-center gap-1"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!notifications || notifications.length === 0) && (
                        <div className="py-20 text-center">
                            <BellIcon className="w-12 h-12 text-secondary-text mx-auto mb-4 opacity-20" />
                            <p className="text-secondary-text font-medium">No system notifications yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
