import React from "react";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

import { useDragWindow, useEvents, usePreventContextMenu } from "@/hooks";
import ipc from "@/ipc";
import useStore from "@/store";
import utils from "@/utils";

export interface WindowContainerProps {
  children: React.ReactNode;
}

export const WindowContainer: React.FC<WindowContainerProps> = (props) => {
  const store = useStore();

  useDragWindow();
  usePreventContextMenu();

  useEvents({
    preview_theme: (data) => {
      utils.applyTheme(data);
    },
    current_theme_updated: (data) => {
      utils.applyTheme(data);
      store.setCurrentTheme(data);
    },
    interface_config_updated: (data) => {
      store.setInterfaceConfig(data);
    },
    timer_config_updated: (data) => store.setTimerConfig(data),
    theme_updated: (data) => {
      if (store.currentTheme?.id === data.id) {
        ipc.setCurrentTheme(data);
      } else if (store.getIdleTheme()?.id === data.id) {
        ipc.setIdleTheme(data);
      } else if (store.getFocusTheme()?.id === data.id) {
        ipc.setFocusTheme(data);
      } else if (store.getBreakTheme()?.id === data.id) {
        ipc.setBreakTheme(data);
      } else if (store.getLongBreakTheme()?.id === data.id) {
        ipc.setLongBreakTheme(data);
      }

      store.patchTheme(data.id, data);
    },
  });

  React.useEffect(() => {
    ipc.getInterfaceConfig().then((data) => store.setInterfaceConfig(data));
    ipc.getCurrentTheme().then((data) => {
      utils.applyTheme(data);
      store.setCurrentTheme(data);
    });
  }, []);

  if (!store.currentTheme) return null;

  return (
    <div className="w-screen h-screen flex flex-col">
      {props.children}

      {/* Gradient Overlay */}
      <motion.div
        animate={{
          scale: [1.1, 1.5, 1.7, 1.2, 1.1],
          top: [-100, -64, -32, -8, -100],
          left: [-100, -32, -64, -32, -100],
          opacity: [0, 0.2, 0.6, 0.4, 1, 0],
          transition: {
            duration: 12,
            repeat: Infinity,
          },
        }}
        exit={{ opacity: 0 }}
        className="fixed w-full h-full"
        style={{
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at center, rgba(var(--primary-color) / 0.2), rgba(var(--window-color) / 0.1) 75%",
        }}
      ></motion.div>

      <Toaster
        position="top-center"
        containerStyle={{ top: 16, zIndex: 999999999 }}
        toastOptions={{
          duration: 1400,
          style: {
            padding: 1,
            paddingInline: 2,
            backgroundColor: "rgb(var(--base-color))",
            borderWidth: 2,
            borderColor: "rgb(var(--window-color) / 0.6)",
            borderRadius: 2,
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "rgb(var(--window-color))",
            textAlign: "center",
          },
        }}
      />
    </div>
  );
};
