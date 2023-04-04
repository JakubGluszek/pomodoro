import React from "react";
import { BiTargetLock } from "react-icons/bi";
import { MdCheckBox, MdStickyNote2 } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

import useStore from "@/store";
import { Button } from "@/components";
import { MainWindowContext } from "@/contexts";
import IntentsView from "./intentsView";
import TasksView from "./tasksView";
import NotesView from "./notesView";

type Tab = "intents" | "notes" | "tasks";

const Sidebar: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>("intents");

  const { display, toggleDisplay } = React.useContext(MainWindowContext)!;
  const store = useStore();

  // handles toggling sidebar via pressing 'Tab' key
  React.useEffect(() => {
    const handleOnKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") toggleDisplay();
    };

    document.addEventListener("keydown", handleOnKeyDown);
    return () => document.removeEventListener("keydown", handleOnKeyDown);
  }, []);

  React.useEffect(() => {
    if (!store.currentIntent) setTab("intents");
  }, [store.currentIntent]);

  return (
    <AnimatePresence>
      {display === "sidebar" && (
        <motion.aside
          className="h-[278px] flex flex-row gap-0.5"
          transition={{ duration: 0.3 }}
          initial={{ width: "0%", opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{
            width: "0%",
            opacity: 0,
            translateX: -128,
          }}
        >
          <TabsView
            display={store.currentIntent ? true : false}
            tab={tab}
            setTab={setTab}
          />
          <div
            className="grow flex flex-col"
            style={{ width: store.currentIntent ? 258 : undefined }} // needed to combat odd overflow caused by some children with 'w-full'
          >
            {tab === "intents" ? <IntentsView /> : null}
            {tab === "tasks" ? <TasksView /> : null}
            {tab === "notes" ? <NotesView /> : null}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

interface TabsViewProps {
  display: boolean;
  tab: Tab;
  setTab: (tab: Tab) => void;
}

const TabsView: React.FC<TabsViewProps> = (props) => {
  return (
    <AnimatePresence>
      {props.display && (
        <motion.div
          className="h-full flex flex-col gap-0.5 overflow-clip rounded-bl"
          transition={{ duration: 0.3 }}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          exit={{ width: 0 }}
        >
          <div className="h-full window">
            <Button
              onClick={() => props.setTab("intents")}
              isSelected={props.tab === "intents"}
              style={{ height: "100%" }}
              transparent
              rounded={false}
            >
              <BiTargetLock size={28} />
            </Button>
          </div>
          <div className="h-full window">
            <Button
              onClick={() => props.setTab("tasks")}
              isSelected={props.tab === "tasks"}
              style={{ height: "100%" }}
              transparent
              rounded={false}
            >
              <MdCheckBox size={28} />
            </Button>
          </div>
          <div className="h-full window">
            <Button
              onClick={() => props.setTab("notes")}
              isSelected={props.tab === "notes"}
              style={{ height: "100%" }}
              transparent
              rounded={false}
            >
              <MdStickyNote2 size={28} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
