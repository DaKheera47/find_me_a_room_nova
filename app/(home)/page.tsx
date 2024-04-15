import { Hero } from "@/components/Hero";
import { Metadata } from "next";

type Props = {};

export const metadata: Metadata = {
  title: "Home",
};

export default function Page({}: Props) {
  return (
    <section className="container mt-8">
      <Hero />
    </section>
  );
}
