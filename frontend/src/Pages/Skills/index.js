import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts";
import { usePageTitle } from "../../Util/title";
import { useApi } from "../../api";
import Spinner from "../../Components/Spinner";
import CharacterSkills from "./CharacterSkills";
import Tabs from "./Tabs";
import Title from "./Title";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import A from "../../Components/A";
import { Modal } from "../../Components/Modal";
import { Box } from "../../Components/Box";
import ModalTitle from "./ModalTitle";

const BetaAnnouncement = styled.div`
  background: #404040;
  box-shadow: 0px 3px hsla(0,0%,0%,0.5);
  color: #cccccc;
  margin-bottom: 13.5px;
  padding: 12px;
  position: relative;
`;

const Skills = () => {
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

const SkillsModal = ({ character, hull, open, setOpen }) => {
  const [ skills ] = useApi(`/api/skills?character_id=${character.id}`);
  const [ mastery, setMastery ] = useState('elite');

  return (
    <Modal open={open} setOpen={setOpen}>
      <Box>
        <ModalTitle character={character} mastery={mastery} setMastery={setMastery} hull={hull} />
        <CharacterSkills mastery={mastery} skills={skills} selectedHull={hull} hidePlans />
      </Box>
    </Modal>
  )
}

const Page = ({ characterId, hull, mastery }) => {
  const [ basicInfo ] = useApi(`/api/pilot/info?character_id=${characterId}`);
  const [ skills ] = useApi(`/api/skills?character_id=${characterId}`);

  usePageTitle(`${basicInfo?.name}'s Skills`);
  return (
    <>
      <Tabs selectedHull={hull} ships={skills?.requirements} />
      <BetaAnnouncement>
        <FontAwesomeIcon fixedWidth icon={faInfoCircle} /> Welcome to our new skills page. Message Nyx Viliana if you would like to provide feedback.
        <p style={{ marginLeft: '25px' }}>Want to use the old page? It will be <A href="/legacy-skills">avaliable here</A> for a limited time.</p>
      </BetaAnnouncement>
      <Title hull={hull} mastery={mastery} />
      <CharacterSkills mastery={mastery} selectedHull={hull} skills={skills} />
    </>
  )
}

export default Skills;
export { SkillsModal };
