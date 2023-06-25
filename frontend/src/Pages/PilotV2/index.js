import { useContext } from "react";
import { usePageTitle } from "../../Util/title";
import { AuthContext } from "../../contexts";
import { useQuery } from "../../Util/query";
import PilotSuspendedBanner from "./SuspendedBanner";
import ProfileBanner from "./ProfileBanner";
import PilotFlightTime from "./FlightTime";
import ProfileTabs from "./ProfileTabs";
import Characters from "./Characters";
import Comments from "./Comments";
import Fits from "./Fits";
import Settings from "./Settings";
import Skills from "./Skills";


const PilotV2Page = () => {
  const authContext = useContext(AuthContext);
  const [{ character_id, tab = 'characters' }] = useQuery();
  var characterId = character_id ?? authContext?.current?.id;


  const partials = {
    characters: <Characters characterId={characterId} />,
    comments: <Comments characterId={characterId} />,
    fits: <Fits characterId={characterId} />,
    settings: <Settings characterId={characterId} />,
    skills: <Skills characterId={characterId} />
  }

  usePageTitle('My Account');
  return !characterId ? null : (
    <>
      <ProfileBanner characterId={characterId} />
      <PilotSuspendedBanner characterId={characterId}/>
      <PilotFlightTime characterId={characterId} />

      <ProfileTabs />

      {partials[tab]}
    </>
  );
}

export default PilotV2Page;