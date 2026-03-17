"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName = "active", to, href, ...props }, ref) => {
    const pathname = usePathname();

    // Support both 'to' (React Router style) and 'href' (Next.js style)
    const destination = href || to || "#";

    // Check if the current path matches the destination
    // Note: Use startsWith(destination) if you want parent links to stay active for sub-routes
    const isActive = pathname === destination;

    return (
      <NextLink
        ref={ref}
        href={destination}
        className={cn(
          "transition-colors", // Optional: smooths out the active state change
          className,
          isActive && activeClassName
        )}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };