import CloseFleet from "./Buttons/CloseFleet";
import ClearWaitlist from "./Buttons/ClearWaitlist";
import InviteAll from "./Buttons/InviteAll";
import OhShit from "./Buttons/OhShit";
import styled from "styled-components";

const ButtonsDOM = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2,minmax(0px,1fr));
  gap: 5px;

  button {
    max-height: 30px;
  }

  @media (max-width: 1300px) {
    grid-column: span 2;
  }

  @media (max-width: 700px) {
    grid-column: unset;
  }
`;

const FleetButtons = ({ fleetId }) => {
  return (
    <ButtonsDOM>
      <InviteAll fleetId={fleetId} />
      <OhShit fleetId={fleetId} />
      <ClearWaitlist fleetId={fleetId} />
      <CloseFleet fleetId={fleetId} />
    </ButtonsDOM>
  )
}

export default FleetButtons;
