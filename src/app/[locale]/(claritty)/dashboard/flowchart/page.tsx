"use client";

import FlowChartEditor from "@/app/_components/dashboard/flow-chart-editor";

export default function FlowChartPage() {
    return (
        <div className="p-6 h-full flex flex-col space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-primary-text">Flow Chart Studio</h1>
                <p className="text-sm text-secondary-text">Design and visualize complex workflows.</p>
            </div>

            <div className="flex-1 w-full min-h-[600px]">
                <FlowChartEditor />
            </div>
        </div>
    );
}
