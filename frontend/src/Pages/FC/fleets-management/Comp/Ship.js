import { useContext } from "react";
import { AuthContext, ToastContext } from "../../../../contexts";
import { apiCall, errorToaster } from "../../../../api";

import { Button as BaseButton } from "../../../../Components/Form";
import { CharacterName } from "../../../../Components/EntityLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const Button = styled(BaseButton)`
  font-size: 12px;
  padding: 0px;
  margin-left: 10px;
  height: 25px;
  width: 25px;
  position: absolute;
  right: 5px;
`;

const ShipDOM = styled.div`
  position: relative;
  text-align: center;
  width: 65px;

  &.capsule {
    img {
      border: ${(props) => props.theme.colors.danger.color} 3px solid;
    }

    .count {
      background: ${(props) => props.theme.colors.danger.color};
      animation: blink-animation 1s steps(2, start) infinite;
    }
  }

  @keyframes blink-animation {
    to {
      visibility: hidden;
    }
  }
  @-webkit-keyframes blink-animation {
    to {
      visibility: hidden;
    }
  }

  img {
    display: block;
    width: 50px;
    border-radius: 25px;
    margin-left: auto;
    margin-right: auto;
  }

  .count {
    background: ${(props) => props.theme.colors.primary.accent};
    border-radius: 1000px;
    font-size: 14px;

    position: absolute;
    bottom: 45px;
    right: 5px;
    height: 19px;
    width: 19px;
  }

  .name {
    display: block;
    color: ${(props) => props.theme.colors.accent4};
    font-size: smaller;
    height: 43px;
    text-overflow: clip;
    overflow: hidden;
  }
`;

const ShipDropdownDOM = styled.div`
  position: relative;

  transition: ease-in-out 0.3s;

  .dropdown-child {
    display: none;
    opacity: 0;
    width: 250px;
    top: 75px;
    z-index: 100;
    background: ${(props) => props.theme.colors.accent1};
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
    position: absolute;

    div {
      margin: 5px;
      position: relative;
    }
  }

  &:hover .dropdown-child {
    display: block;
    opacity: 1;
    transition: opacity 250ms ease-in-out;
   -moz-transition: opacity 250ms ease-in-out;
   -webkit-transition: opacity 250ms ease-in-out;
  }
`

const ShowInfo = (id, whoami, toastContext) => {
  errorToaster(
    toastContext,
    apiCall(`/api/open_window`, {
      method: "POST",
      json: {
        character_id: whoami.id,
        target_id: id,
      },
    })
  );
};

const Ship = ({ characters = [], name, typeId }) => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);

  return (
    <ShipDropdownDOM>
      <ShipDOM className={[670, 33328].includes(typeId) ? "capsule" : ""}>
        <img src={`https://images.evetech.net/types/${typeId}/render?size=64`} alt={name} />
        <span className="count">{characters?.length}</span>
        <span className="name">{name}</span>
      </ShipDOM>

      <div className="dropdown-child">
        { characters?.map((pilot, key) => {
          return (
            <div key={key}>
              <CharacterName {...pilot} />
              <Button variant="primary" onClick={() => ShowInfo(pilot.id, authContext.current, toastContext)}>
                <FontAwesomeIcon fixedWidth icon={faExternalLinkAlt} />
              </Button>
            </div>
          )
        })}
      </div>
    </ShipDropdownDOM>
  );
}

export default Ship;
