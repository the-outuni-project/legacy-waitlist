import styled from "styled-components";
import Account from "./AccountInformation";
import { WaitTime } from "./Timestamps";
import FitCard from "./FitCard";


const FlightstripDOM = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(5,minmax(0px,1fr));
  gap: 16px;
`;

const Fits = styled.div`
  display: grid;
  grid-column: span 3;
  grid-template-columns: repeat(2,minmax(0px,1fr));
  gap: 16px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(1,minmax(0px,1fr));
  }
`;

const Flightstrip = ({ id, character, fits, fleet_time, joined_at }) => {
  return (
    <FlightstripDOM>
      <Account {...character} fleet_time={fleet_time} />

      <WaitTime joined_at={joined_at} />

      <Fits>
        {fits?.map((fit, key) => <FitCard fit={fit} key={key} /> )}
      </Fits>
    </FlightstripDOM>
  )
}

export default Flightstrip;
