import { Icons } from "@/components/icons";
import Link from "next/link";
import React from "react";

type Props = {};

export default function Page({}: Props) {
    const links = [
        {
            title: "Check room availability",
            href: "/room-availability-checker",
            description:
                "Find if a specific room is available for use and view its timetable",
        },
        {
            title: "Find a free room",
            href: "/find-free-room",
            description:
                "Find an available room right now, using filters to find a room that suits your needs",
        },
    ];

    return (
        <section className="container mt-8">
            <div className="grid grid-cols-2 gap-2">
                {links.map((link) => (
                    <Link
                        className="flex size-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none transition-all hover:shadow-md"
                        href={link.href}
                        key={link.href}
                    >
                        <div className="mb-2 text-lg font-medium capitalize">
                            {link.title}
                        </div>

                        <p className="text-sm leading-tight text-muted-foreground">
                            {link.description}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
