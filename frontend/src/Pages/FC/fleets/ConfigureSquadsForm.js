import { useEffect, useState } from "react";
import { useApi } from "../../../api";

import { Label, Select } from "../../../Components/Form";

import styled from "styled-components";

const FormGroup = styled.div`
  flex-grow: 2;
  padding-bottom: 20px;
`;

const SquadWizzard = styled.div`
  width: 100%;
  flex-shrink: 10;

  div {
    display: flex;
    flex-wrap: wrap;

    label, select {
      width: 100%;
    }
  }
`;

const ConfigureSquadsForm = ({ characterId }) => {
  const [ categories ] = useApi('/api/categories');
  const [ fleet_info ] = useApi(`/api/fleet/info?character_id=${characterId}`);

  const [ options, setOptions ] = useState([]);
  const [ squads, setSquads] = useState([]);

  // Flatten the wings > squads into a single dimentional array so we can easily look up values
  useEffect(() => {
    let options = [];
    fleet_info?.wings.forEach(wing => {
      wing?.squads.forEach(squad => {
        options.push({
          label: `${wing.name} > ${squad.name}`,
          squad: squad.id,
          wing: wing.id
        });
      });
    });
    setOptions(options);
  }, [ fleet_info ])

  useEffect(() => {
    let _squads = squads;

    // don't ask me why categories is an object with a property array called categories...
    categories?.categories.forEach(category => {
      // Ensure we have an entry in the array for each category
      _squads[category.id] = _squads[category.id] ?? null;
    });
    setSquads(_squads);
  }, [categories, options, squads, setSquads])

  return (
    <SquadWizzard>
      <strong>Manual Squad Config:</strong>

      <div>
        { categories?.categories?.map((category, key) => {
          const handleSelect = (e) => {
            let _squads = squads;

            let selectedOption = options.find(opt => {
              return opt?.label === e.target.value
            });

            _squads[category.id] = selectedOption;
            console.log(_squads, category.id)
            setSquads(_squads);
          }

          let val = squads[category.id];
          return (
            <FormGroup key={key}>
              <Label htmlFor={category.id}>{category.name}:</Label>
              <Select id={category.id} value={val?.label ?? ''} onChange={handleSelect}>
                { options?.map((squad, key) => {
                  return (
                    <option value={squad.label} key={key}>
                      {squad.label}
                    </option>
                  )
                })}
              </Select>
            </FormGroup>
          )
        })}
      </div>
    </SquadWizzard>
  )
}

export default ConfigureSquadsForm;
