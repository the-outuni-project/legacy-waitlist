import { useParams } from 'react-router-dom';

import FleetSettings from './Settings';

const FleetsManagementPage = () => {
  const url = useParams();

  return (
    <>
      <FleetSettings fleetId={url?.fleetId} />
      {/* <FleetComp fleetId={url?.fleetid} /> */}
      {/* <Waitlist fleetId={url?.fleetid} /> */}
    </>
  )
}

export default FleetsManagementPage;
