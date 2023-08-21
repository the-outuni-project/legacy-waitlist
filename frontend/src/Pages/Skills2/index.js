import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts";
import { usePageTitle } from "../../Util/title";
import { useApi } from "../../api";
import Spinner from "../../Components/Spinner";
import Tabs from "./Tabs";


const Skills2 = ({ children }) => {
  const authContext = useContext(AuthContext);
  const queryParams = new URLSearchParams(useLocation().search);



  if (!authContext) {
    return <Spinner />
  }

  return <Page
    characterId={queryParams.get("character_id") || authContext?.current.id}
    hull={queryParams.get("hull")}
    mastery={queryParams.get("mastery")}
  />
}

const Page = ({ characterId, hull, mastery }) => {
  const [ basicInfo ] = useApi(`/api/pilot/info?character_id=${characterId}`);
  const [ skills ] = useApi(`/api/skills?character_id=${characterId}`);

  console.log(mastery)

  usePageTitle(`${basicInfo?.name}'s Skills`);
  return (
    <>
      <Tabs selectedHull={hull} ships={skills?.requirements} />
    </>
  )
}

export default Skills2;
