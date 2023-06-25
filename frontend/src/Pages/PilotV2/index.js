import { useContext } from "react";
import { usePageTitle } from "../../Util/title";
import { AuthContext } from "../../contexts";
import { useQuery } from "../../Util/query";
import PilotSuspendedBanner from "./SuspendedBanner";
import ProfileBanner from "./ProfileBanner";
import PilotFlightTime from "./FlightTime";
import ProfileTabs from "./ProfileTabs";


const PilotV2Page = () => {
  const authContext = useContext(AuthContext);
  const [{ character_id, tab = 'characters' }] = useQuery();
  var characterId = character_id ?? authContext?.current?.id;

  console.log(tab)

  usePageTitle('My Account');
  return !characterId ? null : (
    <>
      <ProfileBanner characterId={characterId} />
      <PilotSuspendedBanner characterId={characterId}/>
      <PilotFlightTime characterId={characterId} />

      <ProfileTabs />
    </>
  );
}

export default PilotV2Page;