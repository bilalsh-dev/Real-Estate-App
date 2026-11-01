"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FEATURES = [
  {
    imageSrc: "/landing-search3.png",
    title: "Trustworthy and Verified Listings",
    description: "Discover the best rental options with user reviews and ratings.",
    linkText: "Explore",
  },
  {
    imageSrc: "/landing-search2.png",
    title: "Browse Rental Listings with Ease",
    description:
      "Get access to user reviews and ratings for a better understanding of rental options.",
    linkText: "Search",
  },
  {
    imageSrc: "/landing-search1.png",
    title: "Simplify Your Rental Search with Advanced",
    description:
      "Find trustworthy and verified rental listings to ensure a hassle-free experience.",
    linkText: "Discover",
  },
] as const;

export function FeaturesSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-white px-6 py-24 sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="mx-auto max-w-4xl xl:max-w-6xl">
        <motion.h2
          variants={itemVariants}
          className="mx-auto mb-12 w-full text-center text-3xl font-bold sm:w-2/3"
        >
          Quickly find the home you want using our effective search filters!
        </motion.h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 xl:gap-16">
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

type FeatureCardProps = {
  imageSrc: string;
  title: string;
  description: string;
  linkText: string;
};

function FeatureCard({ imageSrc, title, description, linkText }: FeatureCardProps) {
  return (
    <article className="text-center">
      <div className="mb-4 flex h-48 items-center justify-center rounded-lg p-4">
        <Image
          src={imageSrc}
          width={400}
          height={400}
          className="size-full object-contain"
          alt={title}
        />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-4">{description}</p>
      <Link
        href="/search"
        className="inline-block rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
        scroll={false}
      >
        {linkText}
      </Link>
    </article>
  );
}
