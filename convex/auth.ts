import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";
import { convex } from "@convex-dev/better-auth/plugins";
import { query } from "./_generated/server";
import { components } from "./_generated/api"


export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth({
        baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        database: authComponent.adapter(ctx),

        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        plugins: [
            convex({authConfig}),
        ]
    });
};

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        return authComponent.getAuthUser(ctx);
    },
});