import styled from "styled-components";
import { useApi } from "../../api";
import { useHistory, useLocation } from "react-router-dom";

const ShipsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  div {
    img:first-of-type {
      display: block;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 5px;
      transition: ease-in-out 0.3s;
    }

    img:last-of-type {

    }

    color: ${(props) => props.theme.colors.secondary};
    text-align: center;
    max-width: 90px;

    &:hover, &.active {
      cursor: pointer;

      img:first-of-type {
        box-shadow: 1px 5px ${(props) => props.theme.colors.shadow}
      }
    }
  }
`;

const Tabs = ({ selectedHull, ships }) => {
  const [ data ] = useApi(`/api/module/preload`);
  const queryParams = new URLSearchParams(useLocation().search);
  const history = useHistory();

  const items = {};
  Object.keys(data ?? {})?.forEach((key) => {
    if (data[key]?.name) {
      items[data[key]?.name] = key;
    }
  });

  const getShipId = (name) => {
    if (items) {
      return items[name];
    }

    return 0;
  }

  const onClick = (hull) => {
    queryParams.set("hull", hull);
    history.push({
      search: queryParams.toString()
    })
  }

  return ships ? (
    <ShipsContainer>
      { Object.keys(ships).map((ship, key) => {
        if (ship.startsWith('_')) {
          return null;  // The API returns ship group skills
        }

        return (
          <div className={selectedHull === ship ? 'active' : null} key={key} onClick={e => onClick(ship)}>
            <img src={`https://images.evetech.net/types/${getShipId(ship)}/icon?size=64`} alt={ship} />
            {ship}
          </div>
        )
      })}
    </ShipsContainer>
  ) : null
}

export default Tabs;
