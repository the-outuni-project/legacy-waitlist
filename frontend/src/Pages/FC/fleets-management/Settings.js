import { useContext, useEffect } from "react";
import { EventContext } from "../../../contexts";
import { useApi } from "../../../api";
import { usePageTitle } from "../../../Util/title";

import styled from "styled-components";
import FleetButtons from "./Settings/Buttons";
import FleetBoss from "./Settings/FleetBoss";
import FleetVisibilty from "./Settings/FleetVisibilty";
import FleetSize from "./Settings/FleetSize";
import WaitlistSummary from "./Settings/WaitlistSummary";

const SettingsDOM = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(5, minmax(0px, 1fr));
  gap: 16px;

  @media (max-width: 1300px) {
    grid-template-columns: repeat(3, minmax(0px, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: repeat(1, minmax(0px, 1fr));
  }
`;

const Card = styled.div`
  color: rgb(193, 194, 197);
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.accent3};
  border-radius: 16px;
  box-shadow: none;
  outline: 0px;
  padding: 10px;
  user-select: none;
  text-decoration: none;

  > div {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
  }
`;

const Feature = styled.div`
  border: 0;
  border-radius: 32px;
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  position: relative;
  height: 38px;
  min-width: 38px;
  width: 38px;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const Details = styled.div`
  flex-grow: 1;

  p {
    color: ${(props) => props.theme.colors.text.color};
    font-size: smaller;
    text-transform: uppercase;
  }

  div {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;

    button {
      appearance: none;
      border: 1px solid transparent;
      background-color: transparent;
      box-sizing: border-box;
      cursor: pointer;
      color: rgb(233, 236, 239);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 16px;
      min-height: 16px;
      min-width: 16px;
      width: 16px;
    }
  }
`;

const FleetSettings = ({ fleetId, xups }) => {
  const eventContext = useContext(EventContext);
  const [ settings, refresh ] = useApi(`/api/v2/fleets/${fleetId}`);

  useEffect(() => {
    if (!eventContext) return;

    const handleEvent = (e) => {
      let data = JSON.parse(e.data);

      if (data.id === Number(fleetId)) {
        refresh();
      }
    }

    eventContext.addEventListener("fleet_settings", handleEvent);
    return () => eventContext.removeEventListener("fleet_settings", handleEvent);
  },
    [eventContext, fleetId, refresh]
  );

  usePageTitle(`${settings?.boss?.name}'s Fleet`);

  return (
    <SettingsDOM>
      <FleetBoss fleetBoss={settings?.boss} fleetSystem={settings?.boss_system} fleetId={fleetId} />
      <FleetVisibilty visible={settings?.visible} fleetId={fleetId} />
      <FleetSize size={settings?.size} max_size={settings?.size_max} fleetId={fleetId} />
      <WaitlistSummary xups={xups} />
      <FleetButtons fleetId={fleetId} />
    </SettingsDOM>
  )
}

export default FleetSettings;
export { Card, Feature, Details};
