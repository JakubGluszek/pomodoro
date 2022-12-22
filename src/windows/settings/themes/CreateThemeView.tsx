import React from "react";
import { useForm } from "react-hook-form";
import { RiEyeCloseFill, RiEyeFill } from "react-icons/ri";
import { emit } from "@tauri-apps/api/event";

import Button from "@/components/Button";
import { Theme } from "@/bindings/Theme";
import ThemeFormInputs from "./ThemeFormInputs";
import { toast } from "react-hot-toast";
import { useStore } from "@/app/store";
import services from "@/app/services";
import { ThemeForCreate } from "@/bindings/ThemeForCreate";

interface Props {
  hide: () => void;
  theme: Theme;
}

const CreateThemeView: React.FC<Props> = ({ theme, hide }) => {
  const [viewThemePreview, setViewThemePreview] = React.useState(false);

  const { register, handleSubmit, setValue, watch, getValues } =
    useForm<ThemeForCreate>();

  const addTheme = useStore((state) => state.addTheme);

  const containerRef = React.useRef<HTMLFormElement | null>(null);

  const onSubmit = handleSubmit(async (data) => {
    await services.createTheme(data).then((data) => {
      addTheme(data);
      hide();
      toast("Theme created");
    });
  });

  React.useEffect(() => {
    containerRef.current &&
      containerRef.current.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
  }, []);

  React.useEffect(() => {
    setValue("name", theme.name);
    setValue("window_hex", theme.window_hex);
    setValue("base_hex", theme.base_hex);
    setValue("primary_hex", theme.primary_hex);
    setValue("text_hex", theme.text_hex);
  }, []);

  return (
    <form
      ref={containerRef}
      className="flex flex-col gap-6 p-2 text-sm animate-in duration-200 fade-in zoom-in-90 bg-base rounded"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-4 bg-window rounded p-4">
        <ThemeFormInputs register={register} watch={watch} />
      </div>
      <div className="flex flex-row items-center justify-between">
        <Button transparent onClick={() => hide()}>
          Cancel
        </Button>
        <div
          className="p-2"
          onMouseOver={() => {
            emit("preview_theme", getValues());
            setViewThemePreview(true);
          }}
          onMouseLeave={() => {
            emit("preview_theme", theme);
            setViewThemePreview(false);
          }}
        >
          {viewThemePreview ? (
            <RiEyeFill size={24} />
          ) : (
            <RiEyeCloseFill size={24} />
          )}
        </div>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
};

export default CreateThemeView;
