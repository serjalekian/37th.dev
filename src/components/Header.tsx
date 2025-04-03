"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full h-16 fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl opacity-90">
          37th.dev
        </Link>
      </div>
    </header>
  );
}
