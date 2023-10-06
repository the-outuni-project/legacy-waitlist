import React from "react";
import styled from "styled-components";
import { ToastContext, AuthContext } from "../../contexts";
import { apiCall, errorToaster } from "../../api";
import { TimeDisplay } from "./TimeDisplay.js";
import BadgeIcon, { Badge, icons } from "../../Components/Badge";
import { Modal } from "../../Components/Modal";
import { FitDisplay } from "../../Components/FitDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";

import { SkillDisplay } from "../../Components/SkillDisplay";
import { Box } from "../../Components/Box";
import { Title } from "../../Components/Page";

const badgeOrder = [
  "HQ-FC",
  "TRAINEE",
  "LOGI",
  "BASTION",
  "WEB",
  "ELITE",
  "ELITE-GOLD",
  "AMULET",
  "WARPSPEED",
  "HYBRID",
];

async function removeFit(id) {
  return await apiCall("/api/waitlist/remove_fit", {
    json: { id: id },
  });
}

const XCardDOM = styled.div`
  border: solid 2px ${(props) => props.theme.colors[props.variant].color};
  background-color: ${(props) => props.theme.colors[props.variant].color};
  color: ${(props) => props.theme.colors[props.variant].text};
  border-radius: 5px;
  font-size: 0.9em;
  filter: drop-shadow(0px 4px 5px ${(props) => props.theme.colors.shadow});
  min-width: 245px;

  a {
    color: inherit;
    text-decoration: none;
  }
`;
XCardDOM.Head = styled.div`
  display: flex;
  padding: 0.2em 0.2em 0.3em 0.5em;
  align-items: center;
  a {
    font-weight: 600;
  }
`;
XCardDOM.Head.Badges = styled.div`
  margin-left: auto;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  > * {
    margin-left: 0.25em;
  }
  > *:last-child {
    margin-left: 0.5em;
  }
  > span {
    display: flex;
    align-items: center;
  }
  img {
    height: 1.5em !important;
  }
`;
XCardDOM.Content = styled.div`
  display: flex;

  background-color: ${(props) => props.theme.colors.background};
  align-items: center;
  color: ${(props) => props.theme.colors.text};
  img {
    margin-right: 0.5em;
    align-self: flex-start;
  }
  a {
    align-items: center;
    display: flex;
    cursor: pointer;
    width: 100%;
  }
`;

XCardDOM.FooterGroup = styled.div`
  > *:last-child {
    border-radius: 0 0 4px 4px;
  }
`;
XCardDOM.Footer = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.colors.accent1};
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  a:hover {
    background-color: ${(props) => props.theme.colors.accent2};
    cursor: pointer;
  }
  > * {
    flex-grow: 1;
    flex-basis: 0;
  }
`;
XCardDOM.ReviewComment = styled.div`
  padding: 0.5em;
  margin: 0.5em;
  width: 100%;
  text-align: center;
  background-color: ${(props) => props.theme.colors.secondary.color};
  border-radius: 5px;
  color: ${(props) => props.theme.colors.secondary.text};
`;

function ShipDisplay({ fit, onAction }) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const namePrefix = fit.character ? `${fit.character.name}'s ` : "";
  if (fit.dna && fit.hull) {
    return (
      <>
        {modalOpen ? (
          <Modal open={true} setOpen={setModalOpen}>
            <Box>
              <FitDisplay fit={fit} />
              {fit.tags.includes("STARTER") ? (
                <>
                  <Title>Starter skills</Title>
                  <SkillDisplay
                    characterId={fit.character.id}
                    ship={fit.hull.name}
                    filterMin={true}
                  />
                </>
              ) : null}
            </Box>
          </Modal>
        ) : null}
        <a onClick={(evt) => setModalOpen(true)}>
          <img
            style={{ height: "44px" }}
            src={`https://images.evetech.net/types/${fit.hull.id}/icon?size=64`}
            alt={fit.hull.name}
          />
          <span style={{ flexShrink: 1 }}>
            {namePrefix}
            {fit.hull.name}
          </span>
        </a>
      </>
    );
  } else if (fit.hull) {
    return (
      <>
        <img
          style={{ height: "44px" }}
          src={`https://images.evetech.net/types/${fit.hull.id}/icon?size=64`}
          alt={fit.hull.name}
        />
        <span>
          {namePrefix}
          {fit.hull.name}
        </span>
      </>
    );
  } else {
    return (
      <>
        <img
          style={{ height: "44px" }}
          src={`https://images.evetech.net/types/28606/icon?size=64`}
          alt=""
        />
        <span>{namePrefix}Ship</span>
      </>
    );
  }
}

export function XCard({ entry, fit, onAction }) {
  const authContext = React.useContext(AuthContext);
  const toastContext = React.useContext(ToastContext);
  const is_alt = fit.is_alt;
  const accountName = entry.character ? entry.character.name : "Name hidden";
  const tags = _.sortBy(fit.tags, function (item) {
    return badgeOrder.indexOf(item);
  });
  var isSelf = entry.character && entry.character.id === authContext.account_id;
  var tagText = [];
  var tagImages = [];
  tags.forEach((tag) => {
    if (tag in icons) {
      tagImages.push(<BadgeIcon type={tag} key={tag} />);
    } else {
      tagText.push(tag);
    }
  });

  const approvalFlag = fit.approved ? null : (
    <span title="Pending approval">
      <FontAwesomeIcon icon={faExclamationTriangle} />
    </span>
  );

  let variant = 'secondary';
  if (isSelf || authContext.access["waitlist-view"]) {
    switch (fit.state) {
      case 'approved':
        variant = 'success';
        break;
      case 'rejected':
        variant = 'danger';
        break;
      default:
        variant = 'warning';
    }
  }

  return (
    <XCardDOM variant={variant}>
      <XCardDOM.Head>
        <span>{accountName}</span>
        <XCardDOM.Head.Badges>
          {tagImages}
          {approvalFlag}
          <TimeDisplay relativeTo={entry.joined_at} isAlt={is_alt} />
        </XCardDOM.Head.Badges>
      </XCardDOM.Head>
      <XCardDOM.Content>
        <ShipDisplay fit={fit} onAction={onAction} />
      </XCardDOM.Content>
      <XCardDOM.Content>
        <div style={{ FlexWrap: "wrap" }}>
          {tagText.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </XCardDOM.Content>
      {fit.review_comment ? (
        <XCardDOM.Content>
          <XCardDOM.ReviewComment>{fit.review_comment}</XCardDOM.ReviewComment>
        </XCardDOM.Content>
      ) : null}
      <XCardDOM.FooterGroup>
        <XCardDOM.Footer>
          {entry.can_remove ? (
            <a
              title="Remove x-up"
              onClick={(evt) => errorToaster(toastContext, removeFit(fit.id)).then(onAction)}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </a>
          ) : null}
          {_.isFinite(fit.hours_in_fleet) ? (
            <span title="Hours in fleet">{fit.hours_in_fleet}h</span>
          ) : null}
        </XCardDOM.Footer>
        {!is_alt && _.isFinite(fit.hours_in_fleet) && fit.hours_in_fleet < 1 && (
          <XCardDOM.Footer>
            <span>NEWBRO</span>
          </XCardDOM.Footer>
        )}
      </XCardDOM.FooterGroup>
    </XCardDOM>
  );
}
