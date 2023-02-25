import React from "react";
import { MdSettings, MdRemove, MdClose } from "react-icons/md";
import { TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { WebviewWindow } from "@tauri-apps/api/window";
import { toast } from "react-hot-toast";

import { useEvents } from "@/hooks";
import ipc from "@/ipc";
import useStore from "@/store";
import config from "@/config";
import { Layout, Button } from "@/components";
import Timer from "./timer";
import Sidebar from "./sidebar";

const MainWindow: React.FC = () => {
  const [viewSidebar, setViewSidebar] = React.useState(false);

  const store = useStore();

  useEvents({
    active_intent_id_updated: (data) => {
      store.setActiveIntentId(data.active_intent_id);
    },
    intent_created: (data) => store.addIntent(data),
    intent_updated: (data) => store.patchIntent(data.id, data),
    intent_deleted: (data) => {
      if (store.activeIntentId === data.id) {
        ipc.setActiveIntentId(undefined).then(() => {
          store.setActiveIntentId(undefined);
          toast("Active intent has been deleted");
        });
      }

      store.removeIntent(data.id);
    },
    intent_archived: (data) => {
      if (store.activeIntentId === data.id) {
        ipc.setActiveIntentId(undefined).then(() => {
          store.setActiveIntentId(undefined);
          toast("Active intent has been archived");
        });
      }

      store.patchIntent(data.id, data);
    },
    intent_unarchived: (data) => store.patchIntent(data.id, data),
  });

  React.useEffect(() => {
    ipc.getIntents().then((data) => store.setIntents(data));
    ipc.getActiveIntentId().then((data) => store.setActiveIntentId(data));
  }, []);

  // handles toggling sidebar via pressing 'Tab' key
  React.useEffect(() => {
    const handleOnKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") setViewSidebar((view) => !view);
    };

    document.addEventListener("keydown", handleOnKeyDown);
    return () => document.removeEventListener("keydown", handleOnKeyDown);
  }, []);

  return (
    <Layout>
      {/* Window Titlebar */}
      <div className="flex flex-row items-center justify-between p-2">
        <div className="flex flex-row items-center gap-2">
          <Button transparent onClick={() => setViewSidebar(true)}>
            <TbLayoutSidebarRightCollapse size={28} />
          </Button>
          <div>
            <Button
              transparent
              onClick={() =>
                new WebviewWindow("settings", config.webviews.settings)
              }
            >
              <MdSettings size={28} />
            </Button>
          </div>
        </div>
        <h1 className="text-text/80 font-bold">Intentio</h1>
        <div className="flex flex-row items-center gap-2">
          <div>
            <Button transparent onClick={() => ipc.hideMainWindow()}>
              <MdRemove size={28} />
            </Button>
          </div>
          <Button transparent onClick={() => ipc.exitMainWindow()}>
            <MdClose size={28} />
          </Button>
        </div>
      </div>

      {/* Window Content */}
      <div className="grow flex flex-col p-2">
        {store.settings && store.currentTheme && (
          <Timer
            settings={store.settings}
            theme={store.currentTheme}
            activeIntent={store.getActiveIntent()}
          />
        )}
      </div>

      <Sidebar isVisible={viewSidebar} collapse={() => setViewSidebar(false)} />
    </Layout>
  );
};

export default MainWindow;
