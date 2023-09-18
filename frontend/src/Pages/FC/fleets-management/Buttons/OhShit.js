import { useContext, useState } from "react";
import { ToastContext } from "../../../../contexts";
import { apiCall, errorToaster } from "../../../../api";

import { Button } from "../../../../Components/Form";

const OhShit = ({ fleetId }) => {
  const toastContext = useContext(ToastContext);

  const [ pending, isPending ] = useState(false);

  const handleClick = () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Send emergency logi invites?")) {
      return;
    }

    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets/${fleetId}/actions/oh-shit`, {
        method: 'POST',
      })
      .finally(() => isPending(false))
    );
    alert("Emergency invites sent!");
  }

  return <Button outline variant='warning' tabIndex={-1} disabled={pending} onClick={handleClick}>Oh, Shit!</Button>
}

export default OhShit;
