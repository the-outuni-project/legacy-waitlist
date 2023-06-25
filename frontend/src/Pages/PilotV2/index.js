import { useContext } from "react";
import { usePageTitle } from "../../Util/title";
import { AuthContext } from "../../contexts";
import PilotSuspendedBanner from "./SuspendedBanner";
import ProfileBanner from "./ProfileBanner";
import PilotFlightTime from "./FlightTime";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";

const PilotV2Page = () => {
  const authContext = useContext(AuthContext);
  const queryParams = new URLSearchParams(useLocation().search);
  var characterId = queryParams.get("character_id") ?? authContext?.current?.id;


  usePageTitle('My Account');
  return !characterId ? null : (
    <>
      <ProfileBanner characterId={characterId} />
      <PilotSuspendedBanner characterId={characterId}/>
      <PilotFlightTime characterId={characterId} />
    </>
  );
}

export default PilotV2Page;