import styled from "styled-components";
import { FitDisplay } from "../../../Components/FitDisplay";
import { Button } from "../../../Components/Form";

const H2 = styled.h2`
  padding-bottom: 12px;
  font-size: 1.75em;
  flex: 0 0 100%;
`;

const ButtonWrapper = styled.div`
  flex: 0 0 100%;
  button {
    margin: 0px 5px 5px 0px;
  }
`;

const WrongFit = ({ fits = [], goBack, xupAnyway }) => {
  return (
    <>
      <H2>Fix Your Fit{fits.length > 1 && "s"}</H2>
      { fits?.map((fit, key) => {
        return (
          !fit.approved && (
            <div style={{ marginBottom: "20px" }} key={key}>
              <FitDisplay fit={fit} />
            </div>
          )
        );
      })}

      <ButtonWrapper>
        <Button variant="warning" tabIndex="-1" onClick={xupAnyway}>Confirm X-UP</Button>
        <Button variant="primary" onClick={goBack}>Fix my Fit</Button>
      </ButtonWrapper>
    </>
  )
}

export default WrongFit;