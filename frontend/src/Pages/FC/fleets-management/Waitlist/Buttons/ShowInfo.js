import { useContext, useState } from "react";
import { AuthContext, ToastContext } from "../../../../../contexts";
import { apiCall, errorToaster } from "../../../../../api";
import { Button } from "./Button";
import { faExternalLinkAlt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

async function openWindow(target_id, character_id) {
  return await apiCall(`/api/open_window`, {
    json: { target_id, character_id },
  });
}

const ShowInfo = ({ id }) => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);
  const [ pending, isPending ] = useState(false)

  const handleClick = (e) => {
    isPending(true);
    errorToaster(
      toastContext,
      openWindow(id, authContext.current.id)
      .finally(_ => isPending(false))
    );
  }

  return (
    <Button type="button"
      variant="primary"
      data-tooltip-id="tip"
      data-tooltip-html="Open in-game profile"
      onClick={handleClick} disabled={pending}>
      <FontAwesomeIcon fixedWidth icon={!pending ? faExternalLinkAlt : faSpinner} spin={pending} />
    </Button>
  )
}

export default ShowInfo;
