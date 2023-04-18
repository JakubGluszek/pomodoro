import React from "react";
import { MdPauseCircle, MdPlayCircle, MdSkipNext } from "react-icons/md";
import { VscDebugRestart } from "react-icons/vsc";
import Color from "color";

import ipc from "@/ipc";
import utils from "@/utils";
import { Timer } from "@/hooks/useTimer";
import CircleTimerBase, { ColorFormat } from "@/components/CircleTimerBase";
import { Theme } from "@/bindings/Theme";
import { Button } from "@/ui";

interface Props extends Timer {
  displayTimeLeft: boolean;
  theme: Theme;
}

const CircleTimer: React.FC<Props> = (props) => {
  const toggleDisplayTimeLeft = () => {
    ipc.updateInterfaceConfig({
      display_timer_countdown: !props.displayTimeLeft,
    });
  };

  const formattedTimeLeft = utils.formatTimeTimer(
    props.duration - props.elapsedTime
  );

  const sessionType =
    props.type === "Focus"
      ? "Focus"
      : props.type === "Break"
        ? "Break"
        : "Long break";

  const textColor = props.isPlaying
    ? props.theme.primary_hex
    : props.theme.text_hex;

  return (
    <div className="grow flex flex-col window rounded-none overflow-clip">
      <CircleTimerBase
        isPlaying={props.isPlaying}
        duration={props.duration}
        elapsedTime={props.elapsedTimeDetailed}
        strokeWidth={6}
        size={210}
        color={
          Color(
            props.isPlaying ? props.theme.primary_hex : props.theme.base_hex
          )
            .alpha(0.8)
            .hex() as ColorFormat
        }
        trailColor={Color(props.theme.window_hex).hex() as ColorFormat}
      >
        <div className="flex flex-col items-center gap-1 justify-center">
          {props.displayTimeLeft ? (
            <React.Fragment>
              <span
                data-tauri-disable-drag
                className="translate-y-4 font-mono opacity-80"
                onClick={toggleDisplayTimeLeft}
                style={{
                  fontSize: 40,
                  color: textColor,
                }}
              >
                {formattedTimeLeft}
              </span>
              <span className="text-lg text-text/60 whitespace-nowrap">
                {sessionType}
              </span>
            </React.Fragment>
          ) : (
            <span
              className="opacity-80 text-3xl font-bold whitespace-nowrap text-primary"
              data-tauri-disable-drag
              onClick={toggleDisplayTimeLeft}
              style={{
                color: textColor,
              }}
            >
              {sessionType}
            </span>
          )}
        </div>

        <div className="absolute bottom-8 translate-x-1 w-full flex flex-col items-center gap-1 transition-opacity duration-300">
          <div className="group flex flex-row items-center justify-center">
            <button
              tabIndex={-2}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-text/80 group-hover:text-primary"
              onClick={() => {
                props.restart();
              }}
            >
              <VscDebugRestart size={21} />
            </button>

            {props.isPlaying ? (
              <Button
                variant="ghost"
                onClick={() => {
                  props.pause();
                }}
              >
                <MdPauseCircle size={36} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  props.resume();
                }}
              >
                <MdPlayCircle size={36} />
              </Button>
            )}
            <button
              tabIndex={-2}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-text/80 group-hover:text-primary -translate-x-0.5"
              onClick={() => {
                props.skip(true);
              }}
            >
              <MdSkipNext size={26} />
            </button>
          </div>
        </div>
      </CircleTimerBase>
    </div>
  );
};

export default CircleTimer;
