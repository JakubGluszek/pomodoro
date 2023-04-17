import React from "react";
import { MdClose } from "react-icons/md";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";

import { DayDetail } from "@/types";
import { DayView } from "@/components";
import { Session } from "@/bindings/Session";
import { Intent } from "@/bindings/Intent";
import { Button, Input } from "@/ui";

interface Props {
  intents: Intent[];
  sessions: Session[];
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

const TimelineView: React.FC<Props> = (props) => {
  const [collapseAll, setCollapseAll] = React.useState(false);

  const handleFilter = (s: DayDetail): DayDetail | undefined => {
    if (props.filter.length === 0) return s;

    const [fYear, fMonth, fDay] = props.filter.split("-");

    if (!fDay || !fMonth || !fYear) return undefined;

    const [year, month, day] = s.date.split("-");

    if (fDay !== "*" && fDay !== day) {
      return undefined;
    } else if (fMonth !== "*" && fMonth !== month) {
      return undefined;
    } else if (fYear !== "*" && fYear !== year) {
      return undefined;
    }

    return s;
  };

  const days = React.useMemo(() => {
    let days: Map<string, DayDetail> = new Map();
    // group sessions by day
    for (let i = 0; i < props.sessions.length; i++) {
      const date = new Date(parseInt(props.sessions[i].finished_at));

      const iso_date = date.toISOString().split("T")[0];

      const day = days.get(iso_date);
      if (day) {
        day.duration += props.sessions[i].duration / 60;
        day.sessions?.push(props.sessions[i]);
      } else {
        days.set(iso_date, {
          duration: props.sessions[i].duration / 60,
          date: iso_date,
          sessions: [props.sessions[i]],
        });
      }
    }

    return Array.from(days.values()).filter(handleFilter);
  }, [props.sessions, props.filter]);

  return (
    <div className="grow flex flex-col gap-2 animate-in fade-in-0 zoom-in-95">
      {/* Header */}
      <div className="h-8 flex flex-row items-center gap-2">
        <div className="relative w-full flex flex-row items-center gap-1">
          <Input
            value={props.filter}
            onChange={(e) => props.setFilter(e.currentTarget.value)}
            placeholder="Filter by date, e.g. 2022-11-*"
          />
          {props.filter.length > 0 && (
            <div className="absolute bottom-1.5 right-1 opacity-60">
              <Button
                variant="ghost"
                onClick={() => {
                  props.setFilter("");
                }}
              >
                <MdClose size={24} />
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setCollapseAll((prev) => !prev)}
          >
            {collapseAll ? (
              <BsArrowsCollapse size={24} />
            ) : (
              <BsArrowsExpand size={24} />
            )}
          </Button>
        </div>
      </div>
      {/* Body */}
      <div className="grow flex flex-col overflow-y-auto">
        <div className="grow flex flex-col overflow-y-auto">
          {days.length > 0 ? (
            <div className="w-full max-h-0 flex flex-col gap-1 overflow-y">
              {days.map((day) => (
                <DayView
                  key={day.date}
                  data={day}
                  displaySessionLabel
                  collapse={collapseAll}
                />
              ))}
            </div>
          ) : (
            <div className="m-auto text-sm text-text/80 text-center">
              There are no saved sessions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
