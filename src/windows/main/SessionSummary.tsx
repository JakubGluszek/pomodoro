import React from "react";

import { Editor } from "@/components";
import { SessionForCreate } from "@/bindings/SessionForCreate";
import { Button, Pane, Tooltip } from "@/ui";
import { MdArrowForward, MdNotes, MdSave } from "react-icons/md";
import ipc from "@/ipc";
import { toast } from "react-hot-toast";
import { TimerContext } from "@/contexts";

interface SesssionSummaryProps {
  data: SessionForCreate;
  onExit: () => void;
}

export const SessionSummary: React.FC<SesssionSummaryProps> = (props) => {
  const [summary, setSummary] = React.useState("");

  const timer = React.useContext(TimerContext)!;

  React.useEffect(() => {
    timer.pause();
  }, []);

  const saveSession = (summary: string | null) => {
    ipc
      .createSession({
        ...props.data,
        summary: summary?.length === 0 ? null : summary,
      })
      .then(() => {
        toast("Session saved!");

        if (timer.config.auto_start_breaks) timer.resume();

        props.onExit();
      });
  };

  return (
    <Pane className="grow flex flex-col gap-0.5">
      <div className="flex flex-row items-center justify-between p-0.5">
        <div className="flex flex-row items-center text-primary gap-1 font-semibold">
          <MdNotes size={24} />
          <div className="uppercase">Session Summary</div>
        </div>
        <div className="flex flex-row">
          <Tooltip label="Skip summary">
            <Button variant="ghost" onClick={() => saveSession(null)}>
              <MdArrowForward size={24} />
            </Button>
          </Tooltip>
          <Tooltip label="Save">
            <Button variant="ghost" onClick={() => saveSession(summary)}>
              <MdSave size={24} />
            </Button>
          </Tooltip>
        </div>
      </div>
      <Editor value={summary} onChange={setSummary} lang="md" />
    </Pane>
  );
};
