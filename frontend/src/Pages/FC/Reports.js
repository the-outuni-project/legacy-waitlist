import React from "react";
import styled from "styled-components";
import { usePageTitle } from "../../Util/title";
import { useApi } from "../../api";
import { CharacterName } from "../../Components/EntityLinks";
import { formatDate } from "../../Util/time";
import Table, { SortDate, TableControls } from "../../Components/DataTable";
import { Button, Input, Select } from "../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

const Header = styled.div`
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;

  h1 {
    font-size: 32px;
  }
`;

const special_sort = (charA, charB) => {
  const a = charA?.name.toLowerCase();
  const b = charB?.name.toLowerCase();
  if (a > b) return 1;
  else if (b > a) return -1;
  else return 0;
};

const FilterComponents = ({ filters, onChange, onClear}) => {
  const handleSelect = (evt) => {
    let f = filters;
    f.role = evt.target.value === "-1" ? null : evt.target.value;
    onChange(f);
  };
  
  const handleNameChange = (evt) => {
    let f = filters;
    f.name = evt.target.value;
    onChange(f);
  };

  return (
    <div id="filters">
      <span>Role: </span>
      <Select
        value={filters?.role ?? ""}
        onChange={handleSelect}
        style={{
          marginRight: "10px",
          marginBottom: "10px",
          appearance: "auto"
        }}
      >
        <option value={-1}>Any</option>
        {["Fleet Boss", "Logi"].map((role, key) => {
          return (
            <option value={role} key={key} readOnly>
              {role}
            </option>
          )
        })}
      </Select>
      <Input
        value={filters?.name ?? ""}
        onChange={handleNameChange}
        placeholder="pilot name"
        style={{ 
          marginRight: "10px",
          marginBottom: "10px" 
        }}
      />
      <Button variant={"primary"} onClick={onClear} style={{ marginBottom: "10px" }}>
        Clear
      </Button>
    </div>
  )
}

const ReportsPage = () => {
  const [ report, fetchReport ] = useApi("/api/reports");  
  const [ filters, setFilters ] = React.useState({ type: null, name: "" });
  usePageTitle("Activity Reports");
    
  const columns = [
    {
      name: "Pilot Name",
      sortable: true,
      sortFunction: (rowA, rowB) => special_sort(rowA, rowB),
      grow: 2,
      selector: (row) => <CharacterName id={row.character_id} name={row.name} />
    },
    { name: "Role", selector: (row) => row.role },
    {
      name: "Last Seen",
      sortable: true,
      sortFunction: (rowA, rowB) => SortDate(rowA.last_seen, rowB.last_seen),
      selector: (row) => {
        if(!row?.last_seen) {
          return "-";
        }
        return formatDate(new Date(row.last_seen * 1000));
      }
    },
    {
      name: "Hours (last 28 Days)",
      sortable: true,
      sortFunction: (rowA, rowB) => special_sort(rowA.hours_last_month, rowB.hours_last_month),
      selector: (row) => {
        if (!row?.seconds_last_month) {
          return "-";
        }
        return row.seconds_last_month / 3600
      }
    }
  ]

  const TableHeader = React.useMemo(() => {
    const handleClear = () => setFilters({ type: null, name: "" });

    return (
      <TableControls>
        <FilterComponents 
          filters={filters}
          onChange={(e) => {
            setFilters({
              ...e
            })
          }}
          onClear={handleClear}
        />

        <Button variant={"primary"} onClick={fetchReport}>
          <FontAwesomeIcon fixedWidth icon={faRefresh} /> Refresh Reports
        </Button>
      </TableControls>
    )
  })

  const filteredData = (report ?? []).filter(
    (row) => 
      row &&
      (!filters.role || row.role === filters.role) &&
      row.name.toLowerCase().includes(filters?.name.toLowerCase())
  )

  return (
    <>
      <Header>
        <h1>Activity Reports</h1>
      </Header>

      <Table
        columns={columns}
        data={filteredData}
        subHeader
        subHeaderComponent={TableHeader}
        progressPending={!report}
      />
    </>
  )
}

export default ReportsPage;