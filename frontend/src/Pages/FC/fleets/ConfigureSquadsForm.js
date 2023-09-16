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

  const [ squadList, updateSquadList ] = useState(undefined);

  useEffect(() => {
    let options = [];

    fleet_info?.wings.forEach(wing => {
      wing?.squads.forEach(squad => {
        options.push({
          label: `${wing.name} > ${squad.name}`,
          squad: squad.id,
          wing: wing.id,
        })
      })
    })

    updateSquadList(options)

  }, [fleet_info]);

  return (
    <SquadWizzard>
      <strong>Manual Squad Config:</strong>

      <div>
        { categories?.categories?.map((category, key) => {
          // todo:
          //   1. Try to find default matches   where squad name.toLower contains category.id.toLower
          //   2. When a change is made, push up to the parent component so we can send it to the API

          return (
            <FormGroup key={key}>
              <Label htmlFor={category.id}>{category.name}:</Label>
              <Select id={category.id}>
                { squadList?.map((squad, key) => {
                  return <option key={key}>{squad.label}</option>
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
