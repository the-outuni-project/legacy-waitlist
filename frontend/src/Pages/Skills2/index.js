import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts";
import { usePageTitle } from "../../Util/title";
import { useApi } from "../../api";
import Spinner from "../../Components/Spinner";
import Skills from "./Skills";
import Tabs from "./Tabs";
import Title from "./Title";

const Skills2 = ({ children }) => {
  const authContext = useContext(AuthContext);
  const queryParams = new URLSearchParams(useLocation().search);

  // Make 'basic' the default mastery to display if parameter is not specified.
  // Alias 'basic' to 'min', as that is its name in the object returned by the backend.
  const defaultMastery = "basic"
  const mastery = (queryParams.get("mastery") ?? defaultMastery).toLowerCase() === "basic" ? "min" : queryParams.get("mastery")

  if (!authContext) {
    return <Spinner />
  }

  return <Page
    characterId={queryParams.get("character_id") || authContext?.current.id}
    hull={queryParams.get("hull") || "Vindicator"}
    mastery={mastery}
  />
}

const Page = ({ characterId, hull, mastery }) => {
  const [ basicInfo ] = useApi(`/api/pilot/info?character_id=${characterId}`);
  const [ skills ] = useApi(`/api/skills?character_id=${characterId}`);

  usePageTitle(`${basicInfo?.name}'s Skills`);
  return (
    <>
      <Tabs selectedHull={hull} ships={skills?.requirements} />
      <Title hull={hull} mastery={mastery} />
      <Skills mastery={mastery} selectedHull={hull} skills={skills} />
    </>
  )
}

export default Skills2;
