import { useContext } from "react";
import { AuthContext } from "../../contexts";
import { useApi } from "../../api";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { formatDate, timeTillNow } from "../../Util/time";

const Banner = styled.div`
  align-items: center;
  display: flex;
  background-color: ${(props) => props.theme.colors.danger.color};
  color: ${(props) => props.theme.colors.danger.text};
  filter: drop-shadow(0px 4px 5px ${(props) => props.theme.colors.shadow});
  margin-bottom: 20px;  
  padding: 0.1em 0.5em 0.5em;
  width: 100%;
  word-break: break-word;

  svg {
    font-size: 32px;
    margin: 0px 5px 5px 5px;
    flex-shrink: 1;
  }

  div {
    flex-grow: 3;

    p {
      font-size: 1.2em;
      font-weight: 600;
    }

    small {
      font-size: smallest;
    }
  }

  a {
    color: white;
  }
`;


const PilotSuspendedBanner = ({ characterId }) => {
  const authContext = useContext(AuthContext);

  const [bans] = useApi(
    authContext?.access["bans-manage"] && characterId ? `/api/v2/bans/${characterId}` : null
  );

  // Don't display unless you are an FC
  if (!authContext?.access['bans-manage']) {
    return null;
  }

  const active = bans?.find((ban) => ban.revoked_at === null || new Date(ban.revoked_at * 1000) > new Date());

  return !active ? null : (
    <Banner>
      <FontAwesomeIcon fixedWidth icon={faBan} />
      <div>
        <p>
          This {active?.entity?.category ?? "character"} has been suspended { active?.reason ? `because: ${active?.reason}` : '.'}
        </p>
        <small>
          Issued {formatDate(new Date(active.issued_at * 1000))} by {active?.issued_by?.name}{ active.revoked_at && (
          <>, expires {timeTillNow(new Date(active.revoked_at * 1000))}.</>
        )}</small>
      </div>
    </Banner>
  )
}

export default PilotSuspendedBanner;