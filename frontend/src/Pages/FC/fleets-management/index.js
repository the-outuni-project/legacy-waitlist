import { useParams } from 'react-router-dom';

import FleetSettings from './Settings';
import FleetComps from './FleetComps';

const FleetsManagementPage = () => {
  const url = useParams();

  return (
    <>
      <FleetSettings fleetId={url?.fleetId} />
      <FleetComps fleetId={url?.fleetId} />
      {/* <Waitlist fleetId={url?.fleetid} /> */}
      The waitlist will be here soon&trade;
    </>
  )
}

export default FleetsManagementPage;
