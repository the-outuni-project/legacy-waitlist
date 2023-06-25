import { Button, Label, Textarea } from "../../Components/Form";
import { faCheck, faTasks, faTimes, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Modal } from "../../Components/Modal";
import { Box as BaseBox } from "../../Components/Box";
import styled from "styled-components";
import { apiCall, errorToaster } from "../../api";
import { AuthContext, ToastContext } from "../../contexts";
import { addToast } from "../../Components/Toast";
import { FitDisplay } from "../../Components/FitDisplay";
import { InfoNote } from "../../Components/NoteBox";

const Box = styled(BaseBox)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-x: hidden;
  max-width: 1000px !important;

  h2 {
    padding-bottom: 12px;
    font-size: 1.75em;
    flex: 0 0 100%;
  }

  a:first-of-type {
    margin-left: 10px;
  }

  #implants {
    margin-top: 33px;
  }

  form {
    padding-right: 20px;
    flex-grow: 1;
  }

  textarea {
    width: 100%;
    min-height: 350px;
    max-height: 800px;
    margin-right: 20px;
    resize: none;
    // overflow-y: hidden;
  }

  @media (max-width: 900px) {
    form {
      flex: 0 0 100%;
      padding-right: 10px !important;

      textarea {
        width: 100%;
        min-height: 30vh;
        max-height: 500px;
      }
    }
  }

  @media (max-width: 1000px) {
    max-width: 1000px;
    form {
      padding-right: 10px !important;
    }
  }
`;

const exampleFit = String.raw`
[Vindicator, Vindicator]
Shadow Serpentis Damage Control
Centum A-Type Multispectrum Energized Membrane
Centum A-Type Multispectrum Energized Membrane
Federation Navy Magnetic Field Stabilizer
Federation Navy Magnetic Field Stabilizer
Federation Navy Magnetic Field Stabilizer
Federation Navy Magnetic Field Stabilizer

Core X-Type 500MN Microwarpdrive
Federation Navy Stasis Webifier
Federation Navy Stasis Webifier
Federation Navy Stasis Webifier
Large Micro Jump Drive

Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II
Neutron Blaster Cannon II

Large Hybrid Locus Coordinator II
Large Explosive Armor Reinforcer II
Large Hyperspatial Velocity Optimizer II

'Augmented' Ogre x5

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

const Fitcheck = () => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);

  const [badFit, setBadFit] = useState(undefined);
  const [fit, setFit] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleFitValidation = (e) => {
    e.preventDefault();

    if (pending) {
      return; // Stop users from clicking the button twice
    }
    setPending(true);

    errorToaster(
      toastContext,
      validateFit({
        character_id: authContext.current.id,
        eft: fit,
      })
        .then((res) => {
          if (!res.some((xup) => !xup.approved)) {
            addToast(toastContext, {
              variant: "success",
              message: "Your fit is valid, thank you!"
            });
            setFit("");
            setOpen(false);
            return;
          }
          setBadFit(res);
        })
        .finally(() => {
          setPending(false);
        })
    )
  }

  const FailedFitsDisplay = () => {
    return (
      <>
        <div style={{ width: "100%", paddingBottom: "25px" }}>
          <Button style={{ float: "right" }} onClick={() => {
            setBadFit(null);
            setFit("");
            setOpen(false);
          }}>
            <FontAwesomeIcon fixedWidth icon={faUndo} />
            Reset
          </Button>
          <InfoNote>There is something wrong with one (or more) of your fits.</InfoNote>
          <p><FontAwesomeIcon fixedWidth icon={faCheck} /> You have the minimum skills </p>
          <p style={{ color: 'red' }}><FontAwesomeIcon fixedWidth icon={faTimes} /> Your fit is incorrect, please fix the red and yellow items below</p>
        </div>

        {badFit?.map((fit, key) => {
          return (
            !fit.approved && (
              <div style={{ marginBottom: "20px" }} key={key}>
                <FitDisplay fit={fit} />
              </div>
            )
          );
        })}
      </>
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <FontAwesomeIcon fixedWidth icon={faTasks} />
        Check my Fit
      </Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          <h2>Fit Checker!</h2>

          {!badFit ? (
            <form onSubmit={handleFitValidation}>
              <Label htmlFor="fit" required>Paste your fit(s) here:</Label>
              <Textarea value={fit} onChange={(e) => setFit(e.target.value)} placeholder={exampleFit} required />
              <Button variant="success" disabled={pending}>Check Fit</Button>
            </form>
          ) : (
            <FailedFitsDisplay />
          )}
        </Box>
      </Modal>
    </>
  )
}

export default Fitcheck;
