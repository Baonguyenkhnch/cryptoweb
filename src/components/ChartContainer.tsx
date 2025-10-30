import React from "react";
import clsx from "clsx";

export type ChartConfig = Record<
    string,
    { label?: React.ReactNode; color?: string } | undefined
>;

export function ChartContainer({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
    config?: ChartConfig;
}) {
    return (
        <div className={clsx("w-full h-full", className)} data-chart-wrapper>
            {children}
        </div>
    );
}
