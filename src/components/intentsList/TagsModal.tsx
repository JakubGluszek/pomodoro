import React from "react";
import { MdClose } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useClickOutside } from "@mantine/hooks";

import useStore from "@/store";
import ipc from "@/ipc";
import { Intent } from "@/bindings/Intent";
import ModalContainer from "../ModalContainer";
import TagButton from "../TagButton";
import Button from "../Button";

interface Props {
  data: Intent;
  hide: () => void;
}

export const TagsModal: React.FC<Props> = (props) => {
  const [newTag, setNewTag] = React.useState("");

  const ref = useClickOutside(() => props.hide());

  const allTags = useStore((state) => state.getAllTags)();

  // tags from all intents without current intent's tags set
  var allOtherTags = allTags.filter((tag) =>
    props.data.tags.includes(tag) ? undefined : tag
  );

  // remove duplicates
  allOtherTags = [...new Set(allOtherTags)];

  allOtherTags = allOtherTags.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  return (
    <ModalContainer hide={props.hide}>
      <div
        ref={ref}
        className="m-auto w-full max-w-sm flex flex-col gap-2 overflow-y-auto card bg-window shadow-2xl animate-in zoom-in-75"
      >
        <input
          className="border-base"
          value={newTag}
          maxLength={24}
          onChange={(e) => setNewTag(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || newTag.length === 0) return;

            if (allTags.includes(newTag.toLowerCase())) {
              toast("Tag already exists");
              return;
            }
            ipc
              .updateIntent(props.data.id, {
                tags: [newTag.toLowerCase(), ...props.data.tags],
              })
              .then(() => {
                toast("Tag created");
                setNewTag("");
              });
          }}
          autoFocus
          placeholder="Add a tag"
        />

        {props.data.tags.length > 0 ? (
          <div className="flex flex-row flex-wrap gap-1">
            {props.data.tags
              .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
              .map((tag) => (
                <TagButton disabled={true}>
                  <div className="flex flex-row items-center gap-1">
                    <div>{tag}</div>
                    <Button
                      onClick={() =>
                        ipc
                          .updateIntent(props.data.id, {
                            tags: props.data.tags.filter((t) => t !== tag),
                          })
                          .then(() => toast("Tag removed"))
                      }
                      transparent
                      color="danger"
                    >
                      <MdClose size={16} />
                    </Button>
                  </div>
                </TagButton>
              ))}
          </div>
        ) : null}

        {allOtherTags.length > 0 ? (
          <div className="flex flex-col gap-1">
            <div className="text-text/60">Select from existing tags</div>
            <div className="flex flex-row flex-wrap gap-1">
              {allOtherTags.map((tag) => (
                <TagButton
                  onClick={() => {
                    ipc
                      .updateIntent(props.data.id, {
                        tags: [tag, ...props.data.tags],
                      })
                      .then(() => {
                        toast("Tag added");
                      });
                  }}
                >
                  {tag}
                </TagButton>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ModalContainer>
  );
};
