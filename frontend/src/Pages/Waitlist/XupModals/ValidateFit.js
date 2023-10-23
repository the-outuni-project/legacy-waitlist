import styled from "styled-components";
import { Label as BaseLabel, Button, Textarea } from "../../../Components/Form";
import { ImplantDisplay } from "../../../Components/FitDisplay";
import { useContext, useState } from "react";
import { AuthContext, ToastContext } from "../../../contexts";
import { apiCall, errorToaster, useApi } from "../../../api";
//import A from "../../../Components/A";
import Spinner from "../../../Components/Spinner";

const FormGroup = styled.div`
  flex-grow: 2;
  padding-bottom: 20px;
`;

const H2 = styled.h2`
  padding-bottom: 12px;
  font-size: 1.75em;
  flex: 0 0 100%;
`;

const Label = styled(BaseLabel)`
  &::selection {
    background: none;
  }
`;

const exampleFit = String.raw`
[Kronos, CI Kronos Elite]
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
'Peace' Large Remote Armor Repairer
Imperial Navy Large Remote Capacitor Transmitter
Bastion Module I

Large Micro Jump Drive
Shadow Serpentis Sensor Booster
Shadow Serpentis Tracking Computer
...
`.trim();

async function validateFit({ character_id, eft }) {
  return await apiCall("/api/fit-check", {
    json: {
      eft,
      character_id,
    },
  });
}

const ValidateFit = ({ alt, fits, callback, setAlt, setFits }) => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);

  const [ pending, setPending ] = useState(false);

  const [ implants ] = useApi(`/api/implants?character_id=${authContext.current.id}`);

  const handleFitValidation = (e) => {
    e.preventDefault();

    if (pending) {
      return; // Stop users from clicking the button twice
    }

    setPending(true);

    errorToaster(
      toastContext,
      validateFit({
        character_id: authContext?.current.id,
        eft: fits
      })
      .then((res) => callback(res))
      .finally(() => setPending(false))
    );
  }

  return (
    <>
      <H2>{!fits ? "Join" : "Update fits on"} the Waitlist</H2>

      <form onSubmit={handleFitValidation}>
        <FormGroup>
          <Label htmlFor="fit" required>Paste Fit(s):</Label>
          <Textarea id="fit" value={fits} onChange={(e) => setFits(e.target.value)} placeholder={exampleFit} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="alt">
            <input id="alt" type="checkbox" checked={alt} onChange={(e) => setAlt(!alt)} />
            This pilot is an alt
          </Label>
        </FormGroup>

        <Button variant="success" disabled={pending}>X UP</Button>
        {/* <A href={`https://wiki.${window.location.host}/guides/waitlist`} target="_blank">
          How do I join the waitlist?
        </A> */}
      </form>

      <div id="implants">
        { implants ?
           <ImplantDisplay implants={implants.implants} name={`${authContext.current.name}'s capsule`} /> :
           <Spinner /> }
      </div>
    </>
  )
}

export default ValidateFit;