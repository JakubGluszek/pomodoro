import React from "react";
import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { MdAddCircle, MdCircle, MdColorLens } from "react-icons/md";

import { Colors, Settings, Theme } from "../../types";

interface Props {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings | undefined>>;
}

const ThemeSection: React.FC<Props> = ({ settings, setSettings }) => {
  const [themes, setThemes] = React.useState<Theme[]>([]);

  React.useEffect(() => {
    invoke<Theme[]>("themes_read").then((themes) => setThemes(themes));
  }, []);

  const updateCurrentTheme = async (theme: Theme) => {
    invoke<Settings>("settings_update", {
      settings: {
        ...settings,
        theme: { ...settings.theme, current_theme: theme },
      },
    }).then((s) => setSettings(s));
    emit("update_current_theme", theme);
  };

  const create = (name: string, colors: Colors) => {
    invoke<Theme[]>("theme_save", { name, colors }).then((themes) =>
      setThemes(themes)
    );
    return;
  };

  const update = (themes: Theme[]) => {
    invoke<Theme[]>("themes_save", { themes }).then((themes) =>
      setThemes(themes)
    );
    return;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-center gap-2">
        <MdColorLens size={28} />
        <span className="text-lg">Themes</span>
      </div>
      <div className="flex flex-col gap-4">
        <button className="btn card btn-ghost">
          <MdAddCircle size={24} />
          <span>Add custom theme</span>
        </button>
        <div className="flex flex-col gap-2">
          {themes &&
            themes.map((theme) => (
              <div
                key={theme.id}
                style={{
                  backgroundColor: theme.colors.window,
                  border: theme.colors.base,
                }}
                className={`relative h-10 flex flex-row items-center gap-4 rounded border-2`}
                onMouseUp={() => updateCurrentTheme(theme)}
              >
                <div
                  style={{ backgroundColor: theme.colors.primary }}
                  className={`w-12 h-full rounded-l`}
                ></div>
                <span style={{ color: theme.colors.text }}>{theme.name}</span>
                <div
                  style={{ backgroundColor: theme.colors.primary }}
                  className="w-full h-0.5 absolute bottom-0 rounded-b"
                ></div>
                {theme.id === settings.theme.current_theme.id && (
                  <MdCircle
                    size={16}
                    className="absolute top-auto bottom-auto right-4 text-primary"
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSection;
