"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocate } from "@/hooks/use-locate";
import { SEARCH_PATH } from "@/lib/constants";
import { filtersToSearchParams } from "@/lib/searchFilters";
import { DEFAULT_FILTERS } from "@/state/globalSlice";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { locate, isLocating } = useLocate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const place = await locate(query);
    if (!place) return;
    router.push(`${SEARCH_PATH}?${filtersToSearchParams({ ...DEFAULT_FILTERS, ...place })}`);
  };

  return (
    <section className="relative h-screen">
      <Image
        src="/landing-splash.jpg"
        alt="Modern apartment living room"
        fill
        sizes="100vw"
        preload
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/60" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-1/3 w-full -translate-y-1/2 text-center"
      >
        <div className="mx-auto max-w-4xl px-16 sm:px-12">
          <h1 className="mb-4 text-5xl font-bold text-white">
            Start your journey to finding the perfect place to call home
          </h1>
          <p className="mb-8 text-xl text-white">
            Explore our wide range of rental properties tailored to fit your lifestyle and needs!
          </p>
          <form
            role="search"
            onSubmit={(event) => void handleSubmit(event)}
            className="flex justify-center"
          >
            <Input
              type="search"
              aria-label="Search location"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by city, neighborhood or address"
              className="h-12 w-full max-w-lg rounded-none rounded-l-xl border-none bg-white text-primary-700"
            />
            <Button
              type="submit"
              disabled={isLocating}
              className="h-12 rounded-none rounded-r-xl border-none bg-secondary-500 text-white hover:bg-secondary-600"
            >
              Search
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
