import { useParams } from 'react-router-dom';

import FleetSettings from './Settings';
import FleetComps from './FleetComps';

const FleetsManagementPage = () => {
  const url = useParams();

  return (
    <>
      <FleetSettings fleetId={url?.fleetId} />
      <FleetComps fleetId={url?.fleetId} />
      {/* <FleetComp fleetId={url?.fleetid} /> */}
      {/* <Waitlist fleetId={url?.fleetid} /> */}
    </>
  )
}

export default FleetsManagementPage;
