import { useContext, useState } from "react";
import { AuthContext, ToastContext } from "../../../../contexts";
import { apiCall, errorToaster } from "../../../../api";

import { Button } from "./components";
import { Card, Details, Feature } from "./components";
import { CharacterName } from "../../../../Components/EntityLinks";

const FleetBoss = ({ fleetBoss = {}, fleetId, fleetSystem }) => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);

  const [ pending, isPending ] = useState(false);

  const handleClick = () => {
    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets/${fleetId}/boss`, {
        method: 'POST',
        json: {
          fleet_boss: authContext.current.id
        }
      })
      .finally(() => isPending(false))
    );
  }

  return (
    <Card>
      <div>
        <Feature>
          <img src={`https://images.evetech.net/characters/${fleetBoss?.id ?? 1}/portrait?size=64`} alt='Fleet Boss' />
        </Feature>
        <Details>
          <p>Fleet Boss</p>
          <div>
            <CharacterName
              id={fleetBoss.id ?? 1}
              avatar={false}
              name={fleetBoss.name ?? ''}
              noLink={!fleetBoss.id}
            />
            <Button onClick={handleClick} />
          </div>
        </Details>
      </div>
    </Card>
  )
}

export default FleetBoss;
