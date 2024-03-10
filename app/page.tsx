"use client";

import { Hero } from "@/components/Hero";
import ModesAccordion from "@/components/ModesAccordion";

type Props = {};

export default function Page({}: Props) {
  return (
    <section className="container mt-8">
      <Hero />

      {/* <div className="grid grid-cols-2 gap-2">
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
      </div> */}
    </section>
  );
}
