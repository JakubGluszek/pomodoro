import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { twMerge } from "tailwind-merge";

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const { children, className: customClassName, ...restProps } = props;

    let className =
      "flex flex-col border-2 border-base/10 hover:border-base/20 text-sm group backdrop-blur-sm p-1.5 rounded-sm transition-all duration-150 shadow shadow-black/30";

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
