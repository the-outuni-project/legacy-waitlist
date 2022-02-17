import { useApi } from "../../api";

//import { Badge } from "../../Components/Badge";

import { InputGroup, Button, Buttons } from "../../Components/Form";

import { Fitout } from "./FittingSortDisplay";

import { PageTitle } from "../../Components/Page";

import { useLocation, useHistory } from "react-router-dom";

export function Fits() {
  const queryParams = new URLSearchParams(useLocation().search);
  const history = useHistory();
  var Tier = queryParams.get("Tier") || "Starter";
  const setTier = (newTier) => {
    queryParams.set("Tier", newTier);
    history.push({
      search: queryParams.toString(),
    });
  };

  return <FitsDisplay tier={Tier} setTier={setTier} />;
}

function FitsDisplay({ tier, setTier = null }) {
  const [fitData] = useApi(`/api/fittings`);
  if (fitData === null) {
    return <em>Loading fits.</em>;
  }

  return (
    <>
      <PageTitle>HQ FITS</PageTitle>
      {setTier != null && (
        <Buttons style={{ marginBottom: "1em" }}>
          <InputGroup>
            <Button active={tier === "Starter"} onClick={(evt) => setTier("Starter")}>
              Starter
            </Button>
            <Button active={tier === "Basic"} onClick={(evt) => setTier("Basic")}>
              Basic
            </Button>
            <Button active={tier === "Advanced"} onClick={(evt) => setTier("Advanced")}>
              Advanced
            </Button>
            <Button active={tier === "Elite"} onClick={(evt) => setTier("Elite")}>
              Elite
            </Button>
          </InputGroup>
          <InputGroup>
            <Button active={tier === "Other"} onClick={(evt) => setTier("Other")}>
              Support
            </Button>
          </InputGroup>
        </Buttons>
      )}

      {tier === "Starter" ? (
        <Fitout data={fitData} tier="Starter" />
      ) : tier === "Basic" ? (
        <Fitout data={fitData} tier="Basic" />
      ) : tier === "Advanced" ? (
        <Fitout data={fitData} tier="Advanced" />
      ) : tier === "Elite" ? (
        <Fitout data={fitData} tier="Elite" />
      ) : tier === "Other" ? (
        <Fitout data={fitData} tier="Other" />
      ) : null}
    </>
  );
}