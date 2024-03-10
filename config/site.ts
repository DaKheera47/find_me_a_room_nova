export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "Next.js",
    description:
        "Beautifully designed components built with Radix UI and Tailwind CSS.",
    mainNav: [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "Room Availability Checker",
            href: "/room-availability-checker",
        },
        {
            title: "Free Room Finder",
            href: "/find-free-room",
        },
    ],
    links: {
        twitter: "https://twitter.com/shadcn",
        github: "https://github.com/shadcn/ui",
        docs: "https://ui.shadcn.com",
    },
};
