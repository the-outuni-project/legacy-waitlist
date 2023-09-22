import { useState } from "react";
import { useApi } from "../../../../api";
import Navs from "./Navs";
import Ship from "./Ship";
import styled from "styled-components";

const HullContainerDOM = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Fleet = ({ fleetId, myFleet = false }) => {
  const [ activeTab, selectTab ] = useState('all');

  const [ rules ] = useApi('/api/categories/rules');
  const [ pilots ] = useApi(`/api/v2/fleets/${fleetId}/comp`);


  let fleet = {};
  pilots?.forEach(p => {
    if (!fleet[p.hull.id]) {
      fleet[p.hull.id] = {
        id: p.hull.id,
        name: p.hull.name,
        pilots: [{
          id: p.character.id,
          name: p.character.name
        }]
      }
    }
    else {
      fleet[p.hull.id].pilots.push(p.character)
    }
  })

  const categories = {
    all: { id: 'all', name: 'All', ships: []},
    logi: { id: 'logi', name: 'Logistics', ships: []},
    cqc: { id: 'cqc', name: 'CQC', ships: []},
    bastion: { id: 'bastion', name: 'Marauders', ships: []},
  };

  let rules_dict = Object.fromEntries(rules ?? []);

  Object.keys(fleet).forEach(key => {
    categories.all.ships.push(fleet[key]);

    if (rules_dict[key]) {
      let cat = rules_dict[key]
      categories[cat].ships.push(fleet[key]);
    }
  })

  let hulls = [];
  if (categories[activeTab]) {
    hulls = categories[activeTab].ships;
  }

  return (
    <div>
      <Navs
        categories={Object.values(categories)}
        activeTab={activeTab}
        tabVariant={myFleet ? 'primary' : 'secondary'}
        onClick={selectTab}
      />

      <HullContainerDOM>
      { hulls.map((hull, key) => {
        return <Ship
          typeId={hull.id}
          name={hull.name}
          characters={hull.pilots}
          key={key}
        />
      })}
      </HullContainerDOM>
    </div>
  );
}

export default Fleet;
