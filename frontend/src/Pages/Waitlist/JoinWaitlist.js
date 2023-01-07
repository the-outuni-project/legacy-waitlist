import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { apiCall, errorToaster, useApi } from "../../api";
import { Box as BaseBox } from "../../Components/Box";
import { FitDisplay, ImplantDisplay } from "../../Components/FitDisplay";
import { Button, Label, Textarea } from "../../Components/Form";
import { Modal } from "../../Components/Modal";
import { addToast } from "../../Components/Toast";
import A from "../../Components/A";
import { AuthContext, ToastContext } from "../../contexts";

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
  
  const [alt, setAlt] = useState(false);
  const [badFits, setBadFits] = useState(undefined);
  const [fit, setFit] = useState(undefined);
  const [implants] = useApi(`/api/implants?character_id=${authContext.current.id}`);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);  

  const waitlist_id = queryParams.get("wl");
  if (!waitlist_id) {
    return <em>Missing waitlist information</em>;
  }

  const handleSubmit = () => {
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
          setBadFits(undefined);
          setOpen(false);
        })
        .finally(() => {
          setPending(false);
        })
    );
  };

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
            return handleSubmit();
          }
          setBadFits(res);
        })
        .finally(() => {
          setPending(false);
        })
    );
  };

  const FailedFitsDisplay = () => {
    return (
      <>
        <h2 style={{ paddingBottom: "0px" }}>Whoops!</h2>
        <p style={{ paddingBottom: "10px", fontSize: "larger", flex: "0 0 100%" }}>
          There is something wrong with one (or more) of your fits.
        </p>
        {badFits?.map((fit, key) => {
          return (
            !fit.approved && (
              <div style={{ marginBottom: "20px" }} key={key}>
                <FitDisplay fit={fit} />
              </div>
            )
          );
        })}

        <div style={{ flex: "0 0 100%" }}>
          <Button variant="warning" style={{ marginRight: "5px" }} onClick={handleSubmit}>
            Confirm X-UP
          </Button>
          <Button
            onClick={() => {
              setBadFits(undefined);
            }}
          >
            Fix My Fit
          </Button>
        </div>
      </>
    );
  };

  return (
    <>
      <Button variant={!hasFits ? "success" : null} onClick={setOpen}>
        {!hasFits ? "Join Waitlist" : "Update Fits"}
      </Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          {badFits ? (
            <FailedFitsDisplay />
          ) : (
            <>
              <h2>{!hasFits ? "Join" : "Update fits on the"} Waitlist</h2>

              <form onSubmit={handleFitValidation}>
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

                <Button variant="success" disabled={pending}>
                  X UP
                </Button>
                <A href={`https://wiki.${window.location.host}/guides/waitlist`} target="_blank">
                  How do I join the waitlist?
                </A>
              </form>

              <div id="implants">
                {implants && (
                  <ImplantDisplay
                    implants={implants.implants}
                    name={`${authContext.current.name}'s capsule`}
                  />
                )}
              </div>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default JoinWaitlist;
