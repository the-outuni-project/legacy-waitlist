import { useState } from "react";
import styled from "styled-components";
import Navs from "./Waitlist/Navs";
import Spinner from "../../../Components/Spinner";
import Flightstrip from "./Waitlist/FlightStrip";

const WaitlistDOM = styled.div`
  border-top: 1px solid ${(props) => props.theme.colors.accent1};
  padding-top: 10px;
`;

const Waitlist = ({ fleetId, xup }) => {
  const [ tab, selectTab ] = useState('All');

  if (!xup) {
    return (
      <WaitlistDOM style={{ textAlign: 'center' }}>
        <Spinner />
      </WaitlistDOM>
    )
  }

  const temp = xup?.waitlist[0];

  return  (
    <WaitlistDOM>
      <Navs categories={xup?.categories} tab={tab} onClick={selectTab} />

      <Flightstrip {...temp} />
    </WaitlistDOM>
  )
}

export default Waitlist;
