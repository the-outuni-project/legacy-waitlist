import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { apiCall, errorToaster, useApi } from "../../api";
import { Box as BaseBox } from "../../Components/Box";
import { ImplantDisplay } from "../../Components/FitDisplay";
import { Button, Label, Textarea } from "../../Components/Form";
import { Modal } from "../../Components/Modal";
import { addToast } from "../../Components/Toast";
import { AuthContext, ToastContext } from "../../contexts";

const Box = styled(BaseBox)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-x: hidden;
  max-width: 1000px!important;

  h2 {
    padding-bottom: 12px;
    font-size: 1.75em;
    flex: 0 0 100%;
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
    resize: vertical;
    overflow-y: hidden;
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

async function submitFit({ character_id, fit, waitlist_id, is_alt }) {
  await apiCall("/api/waitlist/xup", {
    json: {
      eft: fit,
      character_id,
      waitlist_id: parseInt(waitlist_id),
      is_alt,
    },
  });
}

const JoinWaitlist = ({ hasFits }) => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);
  const queryParams = new URLSearchParams(useLocation().search);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [alt, setAlt] = useState(false);
  const [fit, setFit] = useState(undefined);

  const [implants] = useApi(`/api/implants?character_id=${authContext.current.id}`);

  const waitlist_id = queryParams.get("wl");
  if (!waitlist_id) {
    return <em>Missing waitlist information</em>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (pending) {
      return; // Stop users from clicking the button twice
    }
    setPending(true);

    errorToaster(
      toastContext,
      submitFit({
        character_id: authContext.current.id,
        fit,
        waitlist_id,
        is_alt: alt,
      })
        .then(() => {
          addToast(toastContext, {
            variant: "success",
            message: "Your fits are updated on the waitlist!",
          });
          setAlt(false);
          setFit("");
          setOpen(false);
        })
        .finally(() => setPending(false))
    );
  };

  return (
    <>
      <Button variant={!hasFits ? "success" : null} onClick={setOpen}>
        {!hasFits ? "Join Waitlist" : "Update Fits"}
      </Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          <h2>{!hasFits ? "Join" : "Update fits on the"} Waitlist</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="fit" required>
                Paste your fit(s) here:
              </Label>
              <Textarea
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                placeholder={exampleFit}
                required
              />
            </div>

            <div>
              <Label htmlFor="alt">
                <input id="alt" type="checkbox" checked={alt} onChange={(e) => setAlt(!alt)} />I
                already have a character in fleet
              </Label>
            </div>

            <Button variant="success" pending={pending}>
              X UP
            </Button>
          </form>
          <div id="implants">
            {implants && (
              <ImplantDisplay
                implants={implants.implants}
                name={`${authContext.current.name}'s capsule`}
              />
            )}
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default JoinWaitlist;
