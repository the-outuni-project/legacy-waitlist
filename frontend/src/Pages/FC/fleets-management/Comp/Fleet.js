import { useContext, useEffect, useState } from "react";
import { EventContext } from "../../../../contexts";
import { useApi } from "../../../../api";
import Navs from "./Navs";
import Ship from "./Ship";
import styled from "styled-components";
import { CharacterName } from "../../../../Components/EntityLinks";

const HullContainerDOM = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 93px;
  // justify-content: center;
`;

const Fleet = ({ fleetBoss, fleetId, myFleet = false }) => {
  const eventContext = useContext(EventContext);
  const [ activeTab, selectTab ] = useState('all');

  const [ rules ] = useApi('/api/categories/rules');
  const [ pilots, refresh ] = useApi(`/api/v2/fleets/${fleetId}/comp`);

  useEffect(() => {
    if (!eventContext) return;

    const comp_updated = (e) => {
      let data = JSON.parse(e.data);
      if (data.id === Number(fleetId)) {
        refresh();
      }
    }

    eventContext.addEventListener("fleet_comp", comp_updated);
    return () => {
      eventContext.removeEventListener("fleet_comp", comp_updated);
    }
  }, [eventContext, fleetId, refresh])

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

  hulls = hulls.sort((a, b) => {
    if (a.pilots.length > b.pilots.length) return -1;
    if (b.pilots.length > a.pilots.length) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      <strong>
        { myFleet ? "Your Fleet": (
          <>
            Boss: <CharacterName {...fleetBoss} avatar={false} />
          </>
        )}

      </strong>
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
