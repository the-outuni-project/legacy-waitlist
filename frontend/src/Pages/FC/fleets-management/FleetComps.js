/* eslint-disable eqeqeq */
import styled from "styled-components";
import Fleet from "./Comp/Fleet";
import { useApi } from "../../../api";

const FleetCompDOM = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(${(props) => props.count},minmax(0px,1fr));
  gap: 16px;
  padding-top: 15px;
  justify-content: center;
}
`;

const FleetComps = ({ fleetId }) => {
  let [ fleets ] = useApi(`/api/v2/fleets`);

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
