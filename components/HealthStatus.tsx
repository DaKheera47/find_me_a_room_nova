"use client";

import { useEffect, useState } from "react";
import { getHealthStatus } from "@/lib/apiCalls";
import { HealthStatus } from "@/types/health";

export default function HealthStatusIndicator() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const status = await getHealthStatus();
        setHealthStatus(status);
      } catch (err) {
        setError("Failed to fetch health status");
        console.error("Health status fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchHealthStatus();

    // Set up polling every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isLoading) return "bg-gray-400";
    if (error || !healthStatus) return "bg-red-500";

    return healthStatus.overall === "healthy" ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (error) return "Service Unavailable";
    if (!healthStatus) return "Unknown";

    return healthStatus.overall === "healthy"
      ? "Service Online"
      : "Service Issues";
  };

  const getTooltipText = () => {
    if (isLoading) return "Checking service status...";
    if (error) return "Unable to connect to service";
    if (!healthStatus) return "No status information available";

    const { server, uclan } = healthStatus;
    return `Server: ${server.status} | UCLan: ${uclan.status} (${uclan.responseTime}ms)`;
  };

  return (
    <div className="flex items-center gap-2" title={getTooltipText()}>
      <div
        className={`size-2 rounded-full ${getStatusColor()} ${
          isLoading ? "animate-pulse" : ""
        }`}
      />
      <span className="text-xs text-muted-foreground">{getStatusText()}</span>
    </div>
  );
}
