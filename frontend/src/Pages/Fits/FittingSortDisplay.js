import styled from "styled-components";
import _ from "lodash";
import { DNADisplay } from "../../Components/FitDisplay";
import { ImplantTable } from "./ImplantText";
import { Box } from "../../Components/Box";
import React from "react";
import { Modal } from "../../Components/Modal";
import { Title } from "../../Components/Page";
import { Note } from "../../Components/NoteBox";
import BadgeIcon, { Shield } from "../../Components/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Markdown } from "../../Components/Markdown";
import { BadgeDOM, BadgeModal } from "../../Components/Badge";
import hbadge from "../../Components/BadgeImages/hardwire.png";
import wbadge from "../../Components/BadgeImages/hardwire.png";

export const FitCard = styled.div`
  border: solid 2px ${(props) => props.theme.colors.accent2};
  background-color: ${(props) => props.theme.colors.background};
  border-radius: 5px;
  font-size: 0.9em;
  filter: drop-shadow(0px 3px 4px ${(props) => props.theme.colors.shadow});
  width: 380px;
  a {
  }
  &:hover:not(:disabled):not(.static) {
    border-color: ${(props) => props.theme.colors.accent3};
    cursor: pointer;
  }
  @media (max-width: 480px) {
    width: 100%;
  }
`;

FitCard.Content = styled.div`
  display: flex;
  align-items: center;
  
  color: ${(props) => props.theme.colors.text};
  p {
	  @media (max-width: 480px) {
		  font-size: 3.1vw;
		}
		
	}
  
  
  img {
    border-radius: 3px 0px 0px 3px;
    margin-right: 0.5em;
	
    align-self: flex-start;
  }
}
`;
FitCard.Content.Badges = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  > * {
  }
  > *:last-child {
    margin-right: 0.5em;
  }
  > span {
    display: flex;
    align-items: center;
  }
  img {
    height: 1.3em;
    margin-right: unset;
  }
  @media (max-width: 480px) {
    font-size: 1em;
    > *:last-child {
      margin-right: 0.4em;
    }
  }
`;

const DisplayDOM = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

function Fitout({ data, tier }) {
  var fits = {
    antigank: [],
    dps: [],
    logi: []    
  };

  var logiid = [];
  var notes = {};
  var fitnote;
  var ships;
  if (tier === "Antigank") {
    ships = data.fittingdata;
  } else {
    ships = _.sortBy(data.fittingdata, function (item) {
      return item.name.indexOf("HYBRID");
    });
  }

  _.forEach(data.rules, (ship) => {
    logiid.push(ship);
  });
  _.forEach(data.notes, (note) => {
    notes[note.name] = note.description;
  });
  
  ships.forEach((ship) => {
    if (!(ship.dna && ship.name)) {
      return;
    }

    ship.id = parseInt(ship.dna.split(":", 1)[0]);

    if (ship.name in notes) {
      fitnote = notes[ship.name];
    }
    else
    {
      fitnote = null;
    }

    if (ship.name.toLowerCase().includes("antigank")) {
      fits['antigank'].push(
        <ShipDisplay key={ship.name} fit={ship} id={ship.id} note={fitnote} />
      );
    }
    else if (logiid.includes(ship.id)) {
      fits['logi'].push(
        <ShipDisplay key={ship.name} fit={ship} id={ship.id} note={fitnote} />
      );
    }
    else
    {
      if (ship.name.toLowerCase().includes(tier.toLowerCase()) || tier == "Elite" && ship.name.toLowerCase().includes("web specialist")) {
        fits['dps'].push(
          <ShipDisplay key={ship.name} fit={ship} id={ship.id} note={fitnote} />
        );
      }
    }
  });
  
  return (
    <>
        <div>
          <div style={{ padding: "1em 0 0.4em" }}>
            {tier in notes ? <Markdown>{notes[tier]}</Markdown> : <br />}
          </div>
          {fits.length !== 0 && (
            <>
              { tier == "Antigank" ? (
                <DisplayDOM>{fits['antigank']}</DisplayDOM>
              ) : tier == "Logistics" ? (
                <DisplayDOM>{fits['logi']}</DisplayDOM>
              ) : (
                <DisplayDOM>{fits['dps']}</DisplayDOM>
              )}
            </>
          )}
        </div>
      </>
  )  
}

function ShipDisplay({ fit, id, note }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  
  // Guardians are being removed. Do not display them on the fit page.
  if (fit.name.toLowerCase().indexOf("guardian") !== -1) {
    return null;
  }

  return (
    <>
      {modalOpen ? (
        <Modal open={true} setOpen={setModalOpen}>
          <Box style={{ maxWidth: "510px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ margin: "0 0.5em" }}>
                <DNADisplay dna={fit.dna} name={fit.name} />
              </div>
            </div>
            {note ? (
              <Note variant={"secondary"}>
                <Markdown>{note}</Markdown>
              </Note>
            ) : null}
            {fit.name.toLowerCase().indexOf("hybrid") !== -1 ? (
              <Note variant={"danger"}>
                <p>This fit requires slot 1-5 Amulet implants. Click the implant button above for details.</p>
              </Note>
            ) : fit.name.toLowerCase().indexOf("ascendancy") !== -1 ? (
              <Note variant={"danger"}>
                <p>This fit requires slot 1-5 Ascendancy &amp; the WS-618 implant. Click the implants button above for details.</p>
              </Note>
            ) : null}
          </Box>
        </Modal>
      ) : null}
      <Box mpadding={"0.2em"} style={{ margin: "0.5em 0", paddingLeft: "0em", padding: "0.5em" }}>
        <FitCard variant={"input"}>
          <a onClick={(evt) => setModalOpen(true)}>
            <FitCard.Content>
              <img
                style={{ height: "64px" }}
                src={`https://images.evetech.net/types/${id}/icon`}
                alt={fit.name}
              />
              <p>{fit.name}</p>
              <FitCard.Content.Badges>
                {note ? <FontAwesomeIcon icon={faExclamationCircle} /> : null}
                {fit.name.toLowerCase().indexOf("hybrid") !== -1 ? (
                  <Shield color="red" letter="H" title="Requires Hybrid Clone" />
                ) : fit.name.toLowerCase().indexOf("ascendancy") !== -1 ? (
                  <Shield color="red" letter="W" title="Requires Ascendancy Clone" />
                ) : null}
                {fit.name.toLowerCase().includes("web specialist") && (
                  <BadgeIcon type="WEB" />
                )}
              </FitCard.Content.Badges>
            </FitCard.Content>
          </a>
        </FitCard>
      </Box>
    </>
  );
}

function ImplantOut() {
  return (
    <>
      <DisplayDOM style={{ justifyContent: "initial" }}>
        <ImplantButton name="Ascendancy" img={wbadge} />
        <ImplantButton name="Hybrid" img={hbadge} />
      </DisplayDOM>
    </>
  );
}

function ImplantButton({ name, img }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  return (
    <>
      {modalOpen ? (
        <Modal open={true} setOpen={setModalOpen}>
          <Box style={{ width: "100%" }}>
            <BadgeModal style={{ width: "100%" }}>
              <BadgeModal.Title>
                <div>
                  <img src={img} alt={name} style={{ width: "1.8em", marginRight: "0.5em" }} />
                </div>
                <Title>{name} &nbsp;</Title>
              </BadgeModal.Title>
            </BadgeModal>
            <b>Only visible on waitlist X-UP. </b>
            <br />
            <br />
            <ImplantTable type={name} />
          </Box>
        </Modal>
      ) : null}

      <BadgeDOM>
        <a onClick={(evt) => setModalOpen(true)}>
          <BadgeDOM.Content>
            <BadgeDOM.Icon>
              <img src={img} alt={name} style={{ width: "1.5em" }} />
            </BadgeDOM.Icon>
            {name}
          </BadgeDOM.Content>
        </a>
      </BadgeDOM>
    </>
  );
}

export { Fitout, ImplantOut };
