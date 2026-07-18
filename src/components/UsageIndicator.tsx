"use client";

import { useGetMeQuery, useGetUsageQuery } from "@/lib/api/apiSlice";

export default function UsageIndicator() {
  const { data: user } = useGetMeQuery();
  const { data: usage } = useGetUsageQuery(undefined, { skip: !user });

  if (!usage) return null;

  return (
    <div className="hidden sm:flex items-center gap-3 text-xs text-muted">
      <span>
        {usage.messages_sent}/{usage.messages_limit} messages
      </span>
      <span className="w-1 h-1 rounded-full bg-border" />
      <span>
        {usage.charts_created}/{usage.charts_limit} charts
      </span>
      <span className="w-1 h-1 rounded-full bg-border" />
      <span>
        {usage.reports_created}/{usage.reports_limit} reports
      </span>
    </div>
  );
}
