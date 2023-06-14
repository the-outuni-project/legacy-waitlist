import { useEffect, useState } from "react";
import styled from "styled-components";
import { Input as BaseInput, Button, Label } from "../../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import A from "../../../Components/A";
import Spinner from "../../../Components/Spinner";

const H2 = styled.h2`
  padding-bottom: 12px;
  font-size: 1.75em;
  flex: 0 0 100%;
`;

const FormGroup = styled.div`
  flex-grow: 2;
  padding-bottom: 20px;
`;

const Input = styled(BaseInput)`
  max-width: 75px;
  margin-right: 12px;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
      -webkit-appearance: none;
  }
`;

const VirdianMarauderCheck = ({ onPass }) => {
  const [ val, setVal ] = useState(undefined);
  const [ error, displayError ] = useState(false);
  const [ ready, isReady ] = useState(false);

  useEffect(() => {
    let check = window.localStorage.getItem("viridan");
    if (check) {
      check = JSON.parse(check);
      if (check.expires > Date.now()) {
        let newExpires = new Date();
        newExpires.setDate(newExpires.getDate() + 30);
        check.expires = newExpires.getTime();
        window.localStorage.setItem("viridan", JSON.stringify(check));
        onPass();
      }
      else {
        isReady(true);
      }
    } else {
      isReady(true);
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault();

    if (val == 60) {
      let expires = new Date();
      expires.setDate(expires.getDate() + 30);
      expires = expires.getTime();
      window.localStorage.setItem("viridan", JSON.stringify({ expires }));
      onPass();
    } else {
      displayError(true);
    }
  }

  const bastionGuideUrl = `https://wiki.${window.location.hostname}/guides/bastion`;
  
  return !ready ? (
    <div style={{ margin: 'auto' }}>
      <Spinner />
    </div> 
  ) : (
    <>
      <H2>
        <img src="https://images.evetech.net/types/33400/icon" alt="Bastion Module I" style={{ verticalAlign: 'middle' }} />
        Bastion Check
      </H2>
      <form onSubmit={(e) => onSubmit(e)}>
      <Label htmlFor="iq">What is the cycle time for bastion?</Label>
        <FormGroup>
          <Input id="tq"
            type="number"
            min="0"
            max="300"
            value={val ?? ''}
            onChange={(e) => setVal(e.target.value)}
            required
          /> seconds
        </FormGroup>

        { error && (
          <div style={{ marginBottom: '15px' }}>
            Read the <A href={bastionGuideUrl} target="_blank" style={{ marginLeft: 'unset' }}>Bastion Guide</A>!
          </div>
        )}

        <Button variant="success" disabled={val != 60}>
          <FontAwesomeIcon fixedWidth icon={faCheckCircle} /> Next
        </Button>
      </form>
    </>
  );
}

export default VirdianMarauderCheck;