import { useContext, useEffect } from 'react';
import { useApi } from '../../../api';
import { useParams } from 'react-router-dom';


import FleetSettings from './Settings';
import FleetComps from './FleetComps';
import Waitlist from './Waitlist';
import { EventContext } from '../../../contexts';



const FleetsManagementPage = () => {
  const eventContext = useContext(EventContext);
  const [ xup, refresh ] = useApi(`/api/waitlist`);
  const url = useParams();

  useEffect(() => {
    if (!eventContext) return;

    eventContext.addEventListener("waitlist", refresh);
    return () => eventContext.removeEventListener("waitlist", refresh);
  }, [eventContext, refresh])

  return (
    <>
      <FleetSettings fleetId={url?.fleetId} xups={xup?.waitlist} />
      <FleetComps fleetId={url?.fleetId} />
      <Waitlist fleetId={url?.fleetId} xup={xup} />
    </>
  )
}

export default FleetsManagementPage;
