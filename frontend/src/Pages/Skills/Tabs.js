import styled from "styled-components";
import { useApi } from "../../api";
import { useHistory, useLocation } from "react-router-dom";
import { useMemo } from "react";

const ShipsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;

  div {
    padding-bottom: 10px;
    color: ${(props) => props.theme.colors.secondary};
    text-align: center;
    width: 90px;

    img:first-of-type {
      display: block;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 5px;
      transition: ease-in-out 0.3s;
    }

    @media (max-width: 1000px) {
      font-size: 15px;

      img {
        max-width: 32px;
      }
    }

    img:last-of-type {

    }

    &:hover, &.active {
      cursor: pointer;

      img:first-of-type {
        box-shadow: 0px 0px 6px 0px ${(props) => props.theme.colors.accent};
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

  const orderedShips = useMemo(
    () => {
      const sort_order = [
        'Megathron',
        'Vindicator',
        'Kronos',
        'Apocalypse Navy Issue',
        'Nightmare',
        'Paladin',
        'Oneiros',
        'Nestor',
        'Eos',
        'Damnation'
      ];

      var keys = Object.keys(ships ?? {});
      keys = keys.filter((k) => !k.startsWith('_'));
      keys = keys.sort((a,b) => sort_order.indexOf(a) - sort_order.indexOf(b))
      return keys;
    },
    [ships]
  );

  return ships ? (
    <ShipsContainer>
      { orderedShips.map((ship, key) => (
        <div className={selectedHull === ship ? 'active' : null} key={key} onClick={e => onClick(ship)}>
          <img src={`https://images.evetech.net/types/${getShipId(ship)}/icon?size=64`} alt={ship} />
          {ship}
        </div>
      ))}
    </ShipsContainer>
  ) : null
}

export default Tabs;
