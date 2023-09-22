import styled from "styled-components";
import Fleet from "./Comp/Fleet";

const FleetCompDOM = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2,minmax(0px,1fr));
  gap: 16px;
  padding-top: 15px;

  // div {
  //   border: solid 1px white;
  //   padding-bottom: 100px;
  // }
}
`;

const FleetComps = ({ fleetId }) => {
  return (
    <FleetCompDOM>
      {/* <Fleet fleetId={fleetId} /> */}
      <Fleet fleetId={fleetId} myFleet={true} />
    </FleetCompDOM>
  )
}

export default FleetComps;
