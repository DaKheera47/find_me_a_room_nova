import { siteConfig } from "@/config/site";
import React from "react";
import HealthStatusIndicator from "@/components/HealthStatus";

type Props = {};

export default function Footer({}: Props) {
  return (
    <footer className="group border-t">
      <div className="container flex h-16 items-center justify-between max-md:my-2">
        <HealthStatusIndicator />
        <a
          href={siteConfig.links.author}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline-offset-4 opacity-80 transition-opacity hover:underline group-hover:opacity-100 sm:text-center"
        >
          Made with ❤️ by Shaheer Sarfaraz
        </a>
      </div>
    </footer>
  );
}
