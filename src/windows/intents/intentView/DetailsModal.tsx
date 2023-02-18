import React from "react";
import { BiArchiveIn, BiArchiveOut } from "react-icons/bi";
import { useClickOutside } from "@mantine/hooks";

import useStore from "@/store";
import utils from "@/utils";
import ipc from "@/ipc";
import { ModalContainer, Button } from "@/components";
import { Intent } from "@/bindings/Intent";
import DeleteButton from "@/components/DeleteButton";

interface Props {
  data: Intent;
  exit: () => void;
}

const DetailsModal: React.FC<Props> = (props) => {
  const { data } = props;

  const [viewConfirmDelete, setViewConfirmDelete] = React.useState(false);

  const ref = useClickOutside(() => props.exit());
  const sessions = useStore((state) => state.getSessionsByIntentId)(data.id);

  const totalSessionsDuration = sessions.reduce((p, c) => (p += c.duration), 0);

  React.useEffect(() => {
    let hideConfirm: NodeJS.Timeout | undefined;
    if (viewConfirmDelete) {
      hideConfirm = setTimeout(() => {
        setViewConfirmDelete(false);
      }, 2000);
    } else {
      hideConfirm && clearTimeout(hideConfirm);
    }

    return () => hideConfirm && clearTimeout(hideConfirm);
  }, [viewConfirmDelete]);

  return (
    <ModalContainer hide={props.exit}>
      <div
        ref={ref}
        className="m-auto w-80 p-2 flex flex-col gap-2 bg-window rounded"
      >
        {/* Intent timestamps and stats */}
        <div className="flex flex-col gap-2 bg-base rounded p-3 text-sm shadow-lg">
          <p className="flex flex-row items-center justify-between">
            <span className="text-text/80">Created at:</span>
            <span>{new Date(parseInt(data.created_at)).toLocaleString()}</span>
          </p>
          {data.archived_at ? (
            <p className="flex flex-row items-center justify-between">
              <span className="text-text/80">Archived at:</span>
              <span>
                {new Date(parseInt(data.archived_at)).toLocaleString()}
              </span>
            </p>
          ) : null}
          <p className="flex flex-row items-center justify-between">
            <span className="text-text/80">Total sessions:</span>
            <span>{sessions.length}</span>
          </p>
          <p className="flex flex-row items-center justify-between">
            <span className="text-text/80">Total focus duration:</span>
            <span>{utils.formatTime(totalSessionsDuration)}</span>
          </p>
          <p className="flex flex-row items-center justify-between">
            <span className="text-text/80">Average session duration:</span>
            <span>
              {sessions.length > 0
                ? (totalSessionsDuration / sessions.length).toFixed(1)
                : 0}
              min
            </span>
          </p>
        </div>
        {/* Intent Operations */}
        <div className="flex flex-row items-center justify-between h-7 gap-2 text-sm">
          {data.archived_at ? (
            <Button
              style={{ width: "fit-content" }}
              onClick={() => ipc.unarchiveIntent(data.id)}
            >
              <BiArchiveOut size={20} />
              <span>Unarchive</span>
            </Button>
          ) : (
            <Button
              style={{ width: "fit-content" }}
              onClick={() => ipc.archiveIntent(data.id)}
            >
              <BiArchiveIn size={20} />
              <span>Archive</span>
            </Button>
          )}
          <DeleteButton onClick={() => ipc.deleteIntent(data.id)} />
        </div>
      </div>
    </ModalContainer>
  );
};

export default DetailsModal;
