import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  (
    { width = "w-[360px] lg:w-[900px]", height = "h-[40px]", ...props },
    ref
  ) => {
    return (
      <div ref={ref} {...props}>
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div
            className={cn(
              "relative overflow-hidden rounded-b-2xl",
              width,
              height
            )}
          >
            <div className="pointer-events-none absolute bottom-0 z-10 h-full w-full overflow-hidden border border-[#f5f5f51a] rounded-b-2xl">
              <div className="glass-effect h-full w-full" />
            </div>
            <svg className="w-full h-full">
              <defs>
                <filter id="fractal-noise-glass">
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.05 0.05"
                    numOctaves="1"
                    result="turbulence"
                  />
                  <feDisplacementMap
                    xChannelSelector="R"
                    yChannelSelector="B"
                    scale="100"
                    in="SourceGraphic"
                    in2="turbulence"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
Glass.displayName = "Glass";

export { Glass };
