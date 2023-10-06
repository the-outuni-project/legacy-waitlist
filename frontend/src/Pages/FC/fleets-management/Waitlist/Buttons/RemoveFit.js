import { useContext, useState } from "react";
import { apiCall, errorToaster } from "../../../../../api";
import { Button } from "./Button";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ToastContext } from "../../../../../contexts";

async function removeFit(id) {
  return await apiCall("/api/waitlist/remove_fit", {
    json: { id: id },
  });
}

const RemoveFit = ({ fitId }) => {
  const [ pending, isPending ] = useState(false);
  const toastContext = useContext(ToastContext);

  const handleClick = () => {
    isPending(true);
    errorToaster(
      toastContext,
      removeFit(fitId)
      .finally(_ => isPending(false))
    );
  }

  return (
    <Button type="button"
      variant="danger"
      data-tooltip-id="tip"
      data-tooltip-html="Remove Fit"
      onClick={handleClick}
      disabled={pending}
    >
      <FontAwesomeIcon fixedWidth icon={!pending ? faTrash : faSpinner} spin={pending} />
    </Button>
  )
}

export default RemoveFit;
