"use client";

import { ComponentProps, FC } from "react";

type NavbarProps = ComponentProps<"nav">;

const NavbarComponent: FC<NavbarProps> = () => {
  return (
    <nav>
      <h1>Navbar</h1>
    </nav>
  );
};

NavbarComponent.displayName = "Navbar";

export const Navbar = Object.assign(NavbarComponent);
