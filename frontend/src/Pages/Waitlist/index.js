/* eslint-disable react/display-name */
import React, { useContext, useEffect } from "react";
import { AuthContext, ToastContext, EventContext } from "../../contexts";
import { apiCall, errorToaster, useApi } from "../../api";
import { InputGroup, Button, Buttons } from "../../Components/Form";
import {
  ColumnWaitlist,
  CompactWaitlist,
  LinearWaitlist,
  MatrixWaitlist,
  RowWaitlist,
  NotepadWaitlist,
  CategoryHeading,
} from "./displaymodes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns, faUsers } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import { useQuery } from "../../Util/query";
import { usePageTitle } from "../../Util/title";
import JoinWaitlist from "./JoinWaitlist";
import styled from "styled-components";
import { InfoNote } from "../../Components/NoteBox";
import Fitcheck from "./Fitcheck";

const Users = styled.div`
  margin-bottom: 10px;

  span {
    display: inline-block;
    padding: 0.35em 0.65em;
    font-size: .80em;
    font-weight: 700;
    line-height: 1;
    color: ${(props) => props.theme.colors.text};
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    background-color: ${(props) => props.theme.colors.accent2};
    border-radius: 20px;
  }
`;

function coalesceCalls(func, wait) {
  var nextCall = null;
  var timer = null;

  const timerFn = function () {
    timer = setTimeout(timerFn, wait);

    if (nextCall) {
      const [context, args] = nextCall;
      nextCall = null;
      func.apply(context, args);
    }
  };

  // Splay the initial timer, after that use a constant time interval
  timer = setTimeout(timerFn, wait * Math.random());

  return [
    function () {
      nextCall = [this, arguments];
    },
    function () {
      clearTimeout(timer);
    },
  ];
}

async function removeEntry(id) {
  return await apiCall("/api/waitlist/remove_x", {
    json: { id },
  });
}

function useWaitlist(waitlistId) {
  const eventContext = React.useContext(EventContext);

  const [waitlistData, refreshFn] = useApi(
    waitlistId ? `/api/waitlist?waitlist_id=${waitlistId}` : null
  );

  // Listen for events
  useEffect(() => {
    if (!eventContext) return;

    const [updateFn, clearUpdateFn] = coalesceCalls(refreshFn, 2000);
    const handleEvent = function (event) {
      var data = JSON.parse(event.data);
      if (data.waitlist_id === waitlistId) {
        updateFn();
      }
    };
    eventContext.addEventListener("waitlist_update", handleEvent);
    eventContext.addEventListener("visibility", updateFn);
    return function () {
      clearUpdateFn();
      eventContext.removeEventListener("waitlist_update", handleEvent);
      eventContext.removeEventListener("visibility", updateFn);
    };
  }, [refreshFn, eventContext, waitlistId]);

  return [waitlistData, refreshFn];
}

function useFleetComposition() {
  const authContext = React.useContext(AuthContext);
  const eventContext = React.useContext(EventContext);
  const [fleetMembers, setFleetMembers] = React.useState(null);

  const refreshFn = React.useCallback(() => {
    if (!authContext.access["fleet-view"]) {
      setFleetMembers(null);
      return;
    }
    apiCall(`/api/fleet/members?character_id=${authContext.current.id}`, {}).then(
      setFleetMembers,
      () => setFleetMembers(null)
    );
  }, [authContext, setFleetMembers]);

  React.useEffect(() => {
    refreshFn();
  }, [refreshFn]);

  React.useEffect(() => {
    if (!eventContext) return;

    const [updateFn, clearUpdateFn] = coalesceCalls(refreshFn, 2000);
    eventContext.addEventListener("comp_update", updateFn);
    eventContext.addEventListener("open", updateFn);
    return function () {
      clearUpdateFn();
      eventContext.removeEventListener("comp_update", updateFn);
      eventContext.removeEventListener("open", updateFn);
    };
  }, [refreshFn, eventContext]);

  return fleetMembers;
}

export function Waitlist() {
  const authContext = React.useContext(AuthContext);
  const toastContext = React.useContext(ToastContext);
  const [query, setQuery] = useQuery();
  const [altCol, setAltCol] = React.useState(
    window.localStorage && window.localStorage.getItem("AltColumn")
      ? window.localStorage.getItem("AltColumn") === "true"
      : false
  );
  const waitlistId = parseInt(query.wl);
  const [waitlistData, refreshWaitlist] = useWaitlist(waitlistId);
  const fleetComposition = useFleetComposition();
  const displayMode = query.mode || "columns";

  usePageTitle("Waitlist");

  const setDisplayMode = (newMode) => {
    setQuery("mode", newMode);
  };
  React.useEffect(() => {
    // Redirect to wl=1 if we don't have one
    if (!waitlistId) {
      setQuery("wl", 1);
      return null;
    }
  }, [waitlistId, setQuery]);

  if (!waitlistId) {
    return null; // Should be redirecting
  }

  if (waitlistData === null) {
    return <em>Loading waitlist information.</em>;
  }
  if (!waitlistData.open) {
    return (
      <>
        <InfoNote>The waitlist is currently closed.</InfoNote>
        <Fitcheck />
      </>
    );
  }
  const handleChange = () => {
    setAltCol(!altCol);
    if (window.localStorage) {
      window.localStorage.setItem("AltColumn", !altCol);
    }
  };

  var myEntry = _.find(
    waitlistData.waitlist,
    (entry) => entry.character && entry.character.id === authContext.account_id
  );

  const UsersOnWaitlist = ({ open, waitlist }) => {
    const authContext = useContext(AuthContext);

    // Don't render when WL is closed or user is not an FC.
    if (!open || !authContext.access["waitlist-tag:TRAINEE"]) {
      return null;
    }

   let ids = [];
   for (let i = 0; i < waitlist.length; i++) {
    let fits = waitlist[i].fits;
    for (let ii = 0; ii < fits.length; ii++) {
      if (!ids.includes(fits[ii].character.id)) {
        ids.push(fits[ii].character.id);
      }
    }
   }

    return (
      <span>
        <FontAwesomeIcon fixedWidth icon={faUsers} /> {ids.length}
      </span>
    )
  }

  return (
    <>
      <Users>
        <UsersOnWaitlist {...waitlistData} />
      </Users>

      <Buttons>
        <JoinWaitlist hasFits={myEntry} />

        <Button
          variant={myEntry ? "danger" : null}
          onClick={(evt) => errorToaster(toastContext, removeEntry(myEntry.id))}
          disabled={myEntry ? false : true}
        >
          Leave waitlist
        </Button>
        <InputGroup>
          <Button active={displayMode === "columns"} onClick={(evt) => setDisplayMode("columns")}>
            Columns
          </Button>
          <Button active={displayMode === "matrix"} onClick={(evt) => setDisplayMode("matrix")}>
            Matrix
          </Button>
          <Button active={displayMode === "compact"} onClick={(evt) => setDisplayMode("compact")}>
            Compact
          </Button>
          <Button active={displayMode === "linear"} onClick={(evt) => setDisplayMode("linear")}>
            Linear
          </Button>
          <Button active={displayMode === "rows"} onClick={(evt) => setDisplayMode("rows")}>
            Rows
          </Button>
        </InputGroup>
        {authContext.access["waitlist-view"] && (
          <InputGroup>
            <Button active={displayMode === "notepad"} onClick={(evt) => setDisplayMode("notepad")}>
              Notepad
            </Button>
          </InputGroup>
        )}
        {displayMode === "columns" && (
          <InputGroup>
            <Button onClick={handleChange}>
              <FontAwesomeIcon icon={faColumns} />
            </Button>
          </InputGroup>
        )}
        {!altCol && (
          <CategoryHeading name="Alts" fleetComposition={fleetComposition} altCol={altCol} />
        )}
      </Buttons>

      {displayMode === "columns" ? (
        <ColumnWaitlist
          waitlist={waitlistData}
          onAction={refreshWaitlist}
          fleetComposition={fleetComposition}
          altCol={altCol}
        />
      ) : displayMode === "compact" ? (
        <CompactWaitlist waitlist={waitlistData} onAction={refreshWaitlist} />
      ) : displayMode === "linear" ? (
        <LinearWaitlist waitlist={waitlistData} onAction={refreshWaitlist} />
      ) : displayMode === "matrix" ? (
        <MatrixWaitlist
          waitlist={waitlistData}
          onAction={refreshWaitlist}
          fleetComposition={fleetComposition}
        />
      ) : displayMode === "rows" ? (
        <RowWaitlist
          waitlist={waitlistData}
          onAction={refreshWaitlist}
          fleetComposition={fleetComposition}
        />
      ) : displayMode === "notepad" ? (
        <NotepadWaitlist waitlist={waitlistData} onAction={refreshWaitlist} />
      ) : null}
    </>
  );
}
