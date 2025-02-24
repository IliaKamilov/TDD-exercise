"use client";

import { DeepPartial } from "@/types";
import { ComponentProps, FC } from "react";

export interface NavbarTheme {
  root: NavbarRootTheme;
}

export interface NavbarRootTheme {
  base: string;
}

interface NavbarProps extends ComponentProps<"nav"> {
  open?: boolean;
  theme?: DeepPartial<NavbarTheme>;
}

const NavbarComponent: FC<NavbarProps> = ({}) => {
  // const theme = mergeDeep(getT)
  return (
    <nav>
      <h1>Navbar</h1>
    </nav>
  );
};

NavbarComponent.displayName = "Navbar";

export const Navbar = Object.assign(NavbarComponent);
