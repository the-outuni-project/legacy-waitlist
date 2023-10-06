import { AButton } from "./Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const ViewProfile = ({ id }) => {
  let href = `/pilot?character_id=${id}`;

  return (
    <AButton href={id ? href : null} variant="primary" disabled={!id}>
      <FontAwesomeIcon fixedWidth icon={faUser} />
    </AButton>
  )
}

export default ViewProfile;
