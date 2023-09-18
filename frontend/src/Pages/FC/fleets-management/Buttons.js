import { Button } from "../../../Components/Form";
import CloseFleet from "./Buttons/CloseFleet";
import ClearWaitlist from "./Buttons/ClearWaitlist";
import InviteAll from "./Buttons/InviteAll";
import OhShit from "./Buttons/OhShit";
import styled from "styled-components";

const ButtonsDOM = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 25px;

  button {
    margin: 5px;
  }
`;

const FleetButtons = ({ fleetId }) => {
  return (
    <ButtonsDOM>
      <Button outline variant='primary' disabled>Kick Alt</Button>
      <InviteAll fleetId={fleetId} />
      <OhShit fleetId={fleetId} />
      <ClearWaitlist fleetId={fleetId} />
      <CloseFleet fleetId={fleetId} />
    </ButtonsDOM>
  )
}

export default FleetButtons;
