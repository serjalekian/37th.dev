"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full h-16 fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl">
          37th.dev
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex mr-6">
            <ul className="flex gap-6">
              <li>
                <Link
                  href="#projects"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
