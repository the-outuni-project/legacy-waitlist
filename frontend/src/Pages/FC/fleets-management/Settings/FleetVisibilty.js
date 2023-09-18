import { useContext, useState } from "react";
import { apiCall, errorToaster } from "../../../../api";

import { Switch } from "../../../../Components/Form";
import { Card, Details } from "./components";
import { ToastContext } from "../../../../contexts";


const FleetVisibilty = ({ fleetId, visible }) => {
  const toastContext = useContext(ToastContext);

  const [ pending, isPending ] = useState(false);

  const handleClick = (e) => {
    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets/${fleetId}/visibility`, {
        method: 'POST',
        json: {
          visible: e
        }
      })
      .finally(() => isPending(false))
    );
  }

  return (
    <Card>
      <div>
      <Switch checked={visible} onChange={handleClick} />
      <Details>
        <p>Fleet Visibility</p>
        <div>
          { visible ? "Listed" : "Unlisted" }
        </div>
      </Details>
    </div>
  </Card>
  )
}

export default FleetVisibilty;
