/* eslint-disable eqeqeq */
import { useContext, useEffect } from "react";
import { useApi } from "../../../api";
import styled from "styled-components";
import Fleet from "./Comp/Fleet";
import { EventContext } from "../../../contexts";

const FleetCompDOM = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(${(props) => props.count}, minmax(0px,1fr));
  gap: 16px;
  padding-top: 15px;
  justify-content: center;

  @media (max-width: 800px) {
    grid-template-columns: repeat(1, minmax(0px,1fr));
  }
}
`;

const FleetComps = ({ fleetId }) => {
  const eventContext = useContext(EventContext);
  let [ fleets, refresh ] = useApi(`/api/v2/fleets`);

  useEffect(() => {
    if (!eventContext) return;

    eventContext.addEventListener("fleets", refresh);
    return () => {
      eventContext.removeEventListener("fleets", refresh);
    }
  }, [refresh, eventContext])

  return (
    <FleetCompDOM count={fleets?.length <= 2 ? fleets.length : 2}>
      {fleets?.map((fleet, key) => <Fleet
        fleetId={fleet.id}
        myFleet={fleet.id == fleetId}
        fleetBoss={fleet.boss}
        key={key}
      /> )}
    </FleetCompDOM>
  )
}

export default FleetComps;
