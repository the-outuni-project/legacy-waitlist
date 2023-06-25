import styled from "styled-components";
import { CharacterName } from "../../Components/EntityLinks";
import { useApi } from "../../api";
import Table, { SortAlphabetical } from "../../Components/DataTable";
import { formatDate, formatDuration } from "../../Util/time";

const EsiStatus = styled.span`
  border-radius: 0.40em;  
  display: inline-block;
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  text-align: center;

  &[data-esi-valid='true'] {
    background: ${(props) => props.theme.colors.success.color};

    &::after {
      content: "VALID"
    }
  }

  &[data-esi-valid='false']::after {
    background: ${(props) => props.theme.colors.danger.color};
    
    &::after {
      content: "INVALID"
    }
  }
`;

const columns = [
  { 
    name: "",
    selector: (row) => (
      <img
        src={`https://images.evetech.net/characters/${row.id}/portrait?size=64`}
        alt={`${row.name}'s avatar`}
        style={{ borderRadius: '25%' }}
      />
    ),
    grow: -1
  },
  {
    name: "Character Name",
    selector: (row) => <CharacterName avatar={false} {...row} />,
    sortable: true,
    sortFunction: (a, b) => SortAlphabetical(a.name, b.name)
  },
  {
    name: "ESI Status",
    selector: (row) => (
      <EsiStatus
        data-esi-valid={row.esi_valid}
        title={row.esi_valid ? 'ESI Valid' : 'Please login to this character to fix ESI' }
      />
    )
  },
  {
    name: "Last Fleet",
    selector: (row) => {
      if (!row.last_in_fleet) {
        return '-';
      }

      return formatDate(new Date(row.last_in_fleet * 1000));
    },
    sortable: true,
    customSort: (a, b) => {
      if (a.last_in_fleet > b.last_in_fleet)
        return 1;
      else
        return -1;
    }
  },
  {
    name: "Time in Fleet",
    selector: (row) => {
      if (!row.time_in_fleet) {
        return '-';
      }
      return formatDuration(row.time_in_fleet)
    },
    sortable: true,
    sortFunction: (a, b) => {
      if (a.time_in_fleet > b.time_in_fleet)
        return 1;
      else
        return -1;
    }
  }
]

const Characters = ({ characterId }) => {
    const [ characters ] = useApi(`/api/v1/pilot/${characterId}/characters`);

    return <Table
      columns={columns}  
      data={characters ?? []}
      pagination={false}
      progressPending={!characters}
      textAlign="center"
      verticalAlign="middle"    
    />
}

export default Characters;
