import React from "react";
import { useClickOutside } from "@mantine/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { MenuPosition } from "@/hooks/useContextMenu";

interface Props {
  display: boolean;
  position?: MenuPosition;
  hide: () => void;
  children: React.ReactNode;
}

const ContextMenu: React.FC<Props> = (props) => {
  const [position, setPosition] = React.useState<MenuPosition>({
    left: props.position?.left ?? -9999,
    top: props.position?.top ?? -9999,
  });

  const ref = useClickOutside<HTMLDivElement>(() => props.hide());

  React.useEffect(() => {
    if (!props.display) return;

    const root = document.getElementById("root")!;
    const padding = 8;

    let left = props.position?.left ?? position.left;
    let top = props.position?.top ?? position.top;

    // fix possible x overflow
    if (left + ref.current.clientWidth > root.clientWidth) {
      left =
        left - (left + ref.current.clientWidth - root.clientWidth) - padding;
    }

    // fix possible y overflow
    if (top + ref.current.clientHeight > root.clientHeight) {
      top =
        top - (top + ref.current.clientHeight - root.clientHeight) - padding;
    }

    setPosition({ left, top });
  }, [props.display, props.position]);

  return (
    <AnimatePresence>
      {props.display && (
        <motion.div
          ref={ref}
          className="bg-window rounded shadow-lg shadow-black/60 text-sm p-0.5"
          style={{
            zIndex: 9999,
            position: "fixed",
            left: position.left,
            top: position.top,
          }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <div className="w-28 flex flex-col gap-0.5 overflow-clip rounded">
            {props.children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
