import { useContext, useState } from "react";
import { ToastContext } from "../../../../../contexts";
import { apiCall, errorToaster } from "../../../../../api";
import { Button } from "../../../../../Components/Form";

const InviteAll = ({ fleetId }) => {
  const toastContext = useContext(ToastContext);

  const [ pending, isPending ] = useState(false);

  const handleClick = () => {
    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets/${fleetId}/actions/invite-all`, {
        method: 'POST',
      })
      .finally(() => isPending(false))
    );
  }

  return <Button outline variant='primary' disabled={pending} onClick={handleClick}>Invite All</Button>
}

export default InviteAll;
