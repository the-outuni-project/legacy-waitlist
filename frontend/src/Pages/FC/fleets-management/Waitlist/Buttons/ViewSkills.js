import { useState } from "react";
import { Button } from "./Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStream } from "@fortawesome/free-solid-svg-icons";
import { SkillsModal } from "../../../../Skills";

const ViewSkills = ({ character }) => {
  const [ open, setOpen ] = useState(false);

  return (
    <>
      <Button title={`View ${character?.name}'s skills`} variant='primary' onClick={_ => setOpen(true)}>
        <FontAwesomeIcon fixedWidth icon={faStream} />
      </Button>

      <SkillsModal character={character} hull={'Eos'} open={open} setOpen={setOpen} />
    </>
  )
}

export default ViewSkills;
