import styled from "styled-components";
import BadgeIcon, { Badge } from "../../../../Components/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { TotalFleetTime } from "./Timestamps";

const AccountDOM = styled.div`
  > div {
    align-items: center;
    display: flex;
    font-weight: 500;

    img.avatar {
      border-radius: 32px;
      height: 50px;
      width: 50px;
      user-select: none;
      margin-right: 15px;
    }

    div.details-wrapper {
      display: flex;

      svg {
        height: 20px;
        margin-right: 5px;
        path {
          color: ${(props) => props.theme.colors.warning.color};
        }
      }

      small {
        color: ${(props) => props.theme.colors.danger.accent};
        font-size: small;
        font-style: italic;
      }
    }
  }
`;

const Account = ({ id, name, fleet_time }) => {
  return (
    <AccountDOM>
      <div>
        <img className="avatar" src={`https://images.evetech.net/characters/${id}/portrait?size=64`} alt={name} />
        <div>
          <p>{name}</p>
          <div className="details-wrapper">
            <BadgeIcon type="INSTRUCTOR" />
            { fleet_time?.total < 1 && (
              <FontAwesomeIcon fixedWidth icon={faExclamationTriangle} data-tooltip-id="tip" data-tooltip-html="New to TOP" />
            )}
            { fleet_time?.bastion < 1 && (<Badge variant="danger">New Bastion</Badge>)}
            <TotalFleetTime hours={fleet_time?.hours} />
          </div>
        </div>
      </div>
    </AccountDOM>
  )
}

export default Account;
