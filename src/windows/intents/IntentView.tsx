import React from "react";
import { TiPin, TiPinOutline } from "react-icons/ti";
import {
  MdClose,
  MdInfo,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdToday,
} from "react-icons/md";
import { AiFillFire } from "react-icons/ai";
import { IoMdTime } from "react-icons/io";
import { BsArrowsCollapse, BsArrowsExpand } from "react-icons/bs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import ActivityCalendar, { Day } from "react-activity-calendar";
import ReactTooltip from "react-tooltip";
import Color from "color";
import { useClickOutside } from "@mantine/hooks";
import { useForm } from "react-hook-form";
import { clsx, Textarea } from "@mantine/core";

import Button from "@/components/Button";
import { Session } from "@/bindings/Session";
import { formatTime } from "@/utils";
import { DayDetail } from "@/types";
import { useStore } from "@/app/store";
import { Intent } from "@/bindings/Intent";
import services from "@/app/services";
import { toast } from "react-hot-toast";

interface Props {
  data: Intent;
  sessions: Session[];
}

type Tab = "activity" | "sessions" | "tasks" | "notes";

const IntentView: React.FC<Props> = (props) => {
  const { data } = props;

  const [tab, setTab] = React.useState<Tab>("activity");
  // string to filter sessions by label
  const [filter, setFilter] = React.useState("");
  const [viewDetails, setViewDetails] = React.useState(false);
  const [description, setDescription] = React.useState(data.description ?? "");

  const switchTab = (tab: Tab) => {
    setViewDetails(false);
    setTab(tab);
  };

  return (
    <div className="grow flex flex-col gap-2 p-2 animate-in fade-in-0 duration-75">
      {/* Heading */}
      <div className="w-full h-7 flex flex-row items-center justify-between gap-2">
        <div className="w-full overflow-hidden">
          <IntentLabelView
            label={data.label}
            update={async (label) => services.updateIntent(data.id, { label })}
          />
        </div>
        <div className="min-w-fit flex flex-row items-center gap-1">
          <Button
            transparent
            onClick={() =>
              services.updateIntent(data.id, { pinned: !data.pinned })
            }
          >
            {data.pinned ? <TiPin size={28} /> : <TiPinOutline size={28} />}
          </Button>
          <Button transparent onClick={() => setViewDetails(!viewDetails)}>
            <MdInfo size={28} />
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="relative grow flex flex-col bg-darker/20 rounded shadow-inner overflow-clip">
        {/* Tab content */}
        {!viewDetails ? (
          <div className="grow flex flex-col justify-evenly p-2">
            {tab === "activity" ? (
              <ActivityView
                sessions={props.sessions}
                viewDayDetails={(date: string) => {
                  switchTab("sessions");
                  setFilter(date);
                }}
              />
            ) : null}
            {tab === "sessions" ? (
              <SessionsView
                sessions={props.sessions}
                filter={filter}
                setFilter={(label: string) => setFilter(label)}
              />
            ) : null}
            {tab === "tasks" ? <TasksView /> : null}
            {tab === "notes" ? <NotesView /> : null}
          </div>
        ) : (
          <div className="grow flex flex-col justify-between p-2 animate-in fade-in-0 duration-150">
            <div className="flex flex-col gap-2 bg-window shadow rounded p-2">
              <p className="flex flex-row items-center justify-between">
                <span>Created at</span>
                <span>
                  {new Date(parseInt(data.created_at)).toLocaleString()}
                </span>
              </p>
              {data.archived_at ? (
                <p className="flex flex-row items-center justify-between">
                  <span>Archived at</span>
                  <span>
                    {new Date(parseInt(data.archived_at)).toLocaleString()}
                  </span>
                </p>
              ) : null}
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                classNames={{
                  input: "bg-darker/20 border-none text-text",
                  label: "text-text",
                }}
                placeholder="Add a description here"
                maxLength={128}
                autosize
                maxRows={4}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Button primary size="fill">
                Archive
              </Button>
              <Button
                size="fill"
                onClick={() =>
                  services
                    .deleteIntent(data.id)
                    .then(() => toast("Intent deleted"))
                }
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Tab navigation */}
      <div className="w-full h-7 flex flex-row gap-0.5 rounded-sm overflow-clip text-sm">
        <Button
          size="fill"
          rounded={false}
          primary={tab === "activity"}
          onClick={() => switchTab("activity")}
        >
          Activity
        </Button>
        <Button
          size="fill"
          rounded={false}
          primary={tab === "tasks"}
          onClick={() => switchTab("tasks")}
        >
          Tasks
        </Button>
        <Button
          size="fill"
          rounded={false}
          primary={tab === "notes"}
          onClick={() => switchTab("notes")}
        >
          Notes
        </Button>
        <Button
          size="fill"
          rounded={false}
          primary={tab === "sessions"}
          onClick={() => switchTab("sessions")}
        >
          Sessions
        </Button>
      </div>
    </div>
  );
};

interface IntentLabelViewProps {
  label: string;
  update: (label: string) => void;
}

const IntentLabelView: React.FC<IntentLabelViewProps> = (props) => {
  const [viewEdit, setViewEdit] = React.useState(false);

  const { register, handleSubmit, setValue } = useForm<{ label: string }>();
  const ref = useClickOutside(() => setViewEdit(false));

  const onSubmit = handleSubmit(({ label }) => {
    props.update(label);
    setViewEdit(false);
  });

  React.useEffect(() => {
    setValue("label", props.label);
  }, []);

  return viewEdit ? (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      ref={ref}
    >
      <input
        autoFocus
        {...register("label", { required: true, minLength: 1, maxLength: 24 })}
      />
    </form>
  ) : (
    <h1
      data-tauri-disable-drag
      className="whitespace-nowrap overflow-ellipsis overflow-hidden text-lg"
      onClick={() => setViewEdit(true)}
    >
      {props.label}
    </h1>
  );
};

interface ActivityViewProps {
  sessions: Session[];
  viewDayDetails: (date: string) => void;
}

const ActivityView: React.FC<ActivityViewProps> = (props) => {
  const currentTheme = useStore((state) => state.currentTheme);

  const today = new Date();

  const totalFocused = React.useMemo(
    () => props.sessions.reduce((p, c) => p + c.duration, 0) / 60,
    [props.sessions]
  );

  const focusedToday = React.useMemo(
    () =>
      props.sessions
        .filter(
          (s) =>
            new Date(parseInt(s.finished_at)).toDateString() ==
            today.toDateString()
        )
        .reduce((p, c) => p + c.duration, 0) / 60,
    [props.sessions]
  );

  const dayStreak = React.useMemo(() => {
    let dayStreak = 1;

    const sorted = props.sessions.sort(
      (a, b) => parseInt(b.finished_at) - parseInt(a.finished_at)
    );
    let prevDay = new Date();
    // there might be timezone related issues
    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i];
      const date = new Date(parseInt(s.finished_at));

      if (date.toDateString() === prevDay.toDateString()) continue;
      date.setDate(date.getDate() + 1);

      if (date.toDateString() === prevDay.toDateString()) {
        dayStreak += 1;
        prevDay = new Date(parseInt(s.finished_at));
      } else {
        break;
      }
    }

    return dayStreak;
  }, [props.sessions]);

  const days = React.useMemo(() => {
    const days: Map<string, Day> = new Map();

    // sessions date range
    const dateRange = new Date();
    dateRange.setMonth(dateRange.getMonth() - 5);

    // transform sessions to appropriate Date objects
    for (let i = 0; i < props.sessions.length; i++) {
      const date = new Date(parseInt(props.sessions[i].finished_at));

      if (date.getTime() < dateRange.getTime()) continue;

      const iso_date = date.toISOString().split("T")[0];

      const day = days.get(iso_date);
      if (day) {
        day.count += props.sessions[i].duration / 60;
      } else {
        days.set(iso_date, {
          count: props.sessions[i].duration / 60,
          date: iso_date,
          level: 1,
        });
      }
    }

    // dummy objects needed in order to render graph properly
    const range_iso = dateRange.toISOString().split("T")[0];
    if (!days.has(range_iso)) {
      days.set(range_iso, { date: range_iso, count: 0, level: 0 });
    }
    const today_iso = new Date().toISOString().split("T")[0];
    if (!days.has(today_iso)) {
      days.set(today_iso, { date: today_iso, count: 0, level: 0 });
    }

    const days_array = Array.from(days.values());

    // level assigment based on hours spent
    // "count" equals "hours" in this case
    for (let i = 0; i < days_array.length; i++) {
      if (days_array[i].count >= 9) {
        days_array[i].level = 4;
      } else if (days_array[i].count >= 6) {
        days_array[i].level = 3;
      } else if (days_array[i].count >= 3) {
        days_array[i].level = 2;
      } else if (days_array[i].count > 0) {
        days_array[i].level = 1;
      } else {
        days_array[i].level = 0;
      }

      // needed for tooltip render
      days_array[i].count = parseFloat(days_array[i].count.toFixed(2));
    }
    return days_array;
  }, [props.sessions]);

  return (
    <div className="grow flex flex-col animate-in fade-in-0 duration-75">
      {/* Summary view */}
      <div className="grow flex flex-col justify-evenly rounded gap-4 pt-1">
        <div className="w-full flex flex-row gap-1">
          {/* Total time focused */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full flex flex-row items-center justify-center gap-1">
              <IoMdTime className="text-primary/80" size={28} />
              <span className="text-lg font-semibold">Total</span>
            </div>
            <div className="bg-window border-b-2 border-primary/80 w-full flex flex-col items-center justify-center rounded px-1 py-4 shadow">
              <span>{formatTime(totalFocused * 60)}</span>
            </div>
          </div>
          {/* Today's focused time */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full flex flex-row items-center justify-center gap-1">
              <MdToday className="text-primary/80" size={26} />
              <span className="text-lg font-semibold">Today</span>
            </div>
            <div className="bg-window border-b-2 border-primary/80 w-full flex flex-col items-center justify-center rounded px-1 py-4 shadow">
              <span>{formatTime(focusedToday * 60)}</span>
            </div>
          </div>
          {/* Day Streak */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex flex-row items-center justify-center gap-1">
              <AiFillFire className="text-primary/80" size={28} />
              <span className="text-lg font-semibold">Streak</span>
            </div>
            <div className="bg-window border-b-2 border-primary/80 w-full flex flex-col items-center justify-center rounded px-1 py-4 shadow">
              <span>
                {dayStreak} {dayStreak === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>

        <ActivityCalendar
          hideMonthLabels
          eventHandlers={{
            onClick: () => {
              return (data) => props.viewDayDetails(data.date);
            },
          }}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 16,
            marginBottom: 16,
          }}
          theme={{
            level0: Color(currentTheme?.primary_hex).alpha(0.1).string(),
            level1: Color(currentTheme?.primary_hex).alpha(0.4).string(),
            level2: Color(currentTheme?.primary_hex).alpha(0.6).string(),
            level3: Color(currentTheme?.primary_hex).alpha(0.8).string(),
            level4: currentTheme?.primary_hex!,
          }}
          color={currentTheme?.primary_hex}
          data={days.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )}
          labels={{
            legend: {
              less: "Less",
              more: "More",
            },
            months: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            tooltip: "<strong>Focused for {{count}}h</strong> on {{date}}",
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          }}
          hideTotalCount
        >
          <ReactTooltip html />
        </ActivityCalendar>
      </div>
    </div>
  );
};

interface SessionViewProps {
  sessions: Session[];
  filter: string;
  setFilter: (label: string) => void;
}

const SessionsView: React.FC<SessionViewProps> = (props) => {
  const [skip, setSkip] = React.useState(0);
  const [limit, setLimit] = React.useState(25);

  const [parent] = useAutoAnimate<HTMLDivElement>();
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
    <div className="grow flex flex-col gap-2 animate-in fade-in-0 duration-75">
      {/* Header */}
      <div className="h-8 flex flex-row items-center gap-1">
        <div className="relative w-full flex flex-row items-center gap-1">
          <input
            autoComplete="off"
            value={props.filter}
            onChange={(e) => props.setFilter(e.currentTarget.value)}
            className="pr-8"
            placeholder="Filter by date, e.g. 2022-11-*"
            type="text"
          />
          {props.filter.length > 0 && (
            <div className="absolute bottom-1 right-1 animate-in fade-in brightness-75">
              <Button
                transparent
                onClick={() => {
                  props.setFilter("");
                }}
              >
                <MdClose size={28} />
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-row items-center gap-2 px-2">
          <Button transparent onClick={() => setCollapseAll((prev) => !prev)}>
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
          <div
            ref={parent}
            className="w-full max-h-0 flex flex-col gap-1 overflow-y"
          >
            {days.slice(skip, limit).map((day) => (
              <DayView key={day.date} data={day} collapse={collapseAll} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DayViewProps {
  data: DayDetail;
  collapse: boolean;
}

const DayView: React.FC<DayViewProps> = (props) => {
  const { data } = props;

  const [viewMore, setViewMore] = React.useState(false);

  React.useEffect(() => {
    setViewMore(props.collapse);
  }, [props.collapse]);

  return (
    <div
      data-tauri-disable-drag
      className={clsx(
        "flex flex-col p-1 transition-color rounded shadow",
        viewMore ? "bg-base" : "bg-base/40"
      )}
    >
      <div
        className={clsx(
          "h-8 w-full flex flex-row items-center justify-between"
        )}
      >
        <span className="text-lg text-text/80">{data.date}</span>
        <Button
          tabIndex={-1}
          transparent
          onClick={() => setViewMore((v) => !v)}
        >
          {viewMore ? (
            <MdKeyboardArrowUp size={28} />
          ) : (
            <MdKeyboardArrowDown size={28} />
          )}
        </Button>
      </div>
      {viewMore ? (
        <div className="flex flex-col p-2 bg-window/80 rounded">
          <h1>More</h1>
        </div>
      ) : null}
    </div>
  );
};

const TasksView: React.FC = () => {
  return <div className="grow flex flex-col gap-2">Tasks</div>;
};

const NotesView: React.FC = () => {
  return <div className="grow flex flex-col gap-2">Notes</div>;
};

export default IntentView;
