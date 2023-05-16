import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { clsx } from "@mantine/core";

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  active?: boolean;
  withBorder?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const {
      children,
      active,
      withBorder = false,
      className: customClassName,
      ...restProps
    } = props;

    let className = clsx(
      "group bg-base/[15%] hover:bg-base/20 backdrop-blur-sm p-1.5 rounded transition-all duration-150",
      active
        ? "border-primary/60 hover:border-primary/80 text-primary/80"
        : "border-base/30 hover:border-base/40 shadow shadow-black/20",
      withBorder && "border-2 border-base/30 hover:border-base/40"
    );

    if (customClassName) {
      className = twMerge(className, customClassName);
    }

    return (
      <motion.div ref={ref} className={className} {...restProps}>
        {children}
      </motion.div>
    );
  }
);
