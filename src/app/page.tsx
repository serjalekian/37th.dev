import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          37th
        </h1>
        <p className="mt-6 text-xl leading-8 text-muted-foreground">
          Software Engineer & Designer.
        </p>
        <p className="mt-2 text-lg leading-8 text-muted-foreground opacity-80">
          Exploring the intersection of code and creativity.  
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="#projects"
            className={
              cn([
                "rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
                "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary",
                "transition-all duration-300 ease-in-out",
              ])
            }
          >
            View Projects
          </a>
          <a href="#contact" className="text-sm font-semibold leading-6 text-foreground">
            Get in touch <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  );
}
