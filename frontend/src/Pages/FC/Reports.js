import React from "react";
import styled from "styled-components";
import { usePageTitle } from "../../Util/title";
import { useApi } from "../../api";
import { CharacterName } from "../../Components/EntityLinks";
import { formatDatetime } from "../../Util/time";
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
  const a = charA.name.toLowerCase();
  const b = charB.name.toLowerCase();
  if (a > b) return 1;
  else if (b > a) return -1;
  else return 0;
};

const ReportsPage = () => {
  const [ report, fetchReport ] = useApi("/api/reports");  
  const [ filters, setFilters ] = React.useState({ type: null, name: "" });
  usePageTitle("Activity Reports");
    
  const columns = [
    {
      name: "Pilot Name",
      sortable: true,
      sortFunction: (rowA, rowB) => special_sort(rowA.character, rowB.character),
      grow: 2,
      selector: (row) => <CharacterName id={row.id} name={row.name} />
    },
    { name: "Type", selector: (row) => row['type'] },
    {
      name: "Last Seen",
      sortable: true,
      sortFunction: (rowA, rowB) => SortDate(rowA.last_seen, rowB.last_seen),
      selector: (row) => formatDatetime(new Date(row.last_seen * 1000))
    },
    {
      name: "Hours (last 28 Days)",
      sortable: true,
      sortFunction: (rowA, rowB) => special_sort(rowA.hours_last_month, rowB.hours_last_month),
      selector: (row) => row?.hours_last_month
    }
  ]

  const TableHeader = React.useMemo(() => {
    const handleClear = () => setFilters({ type: null, name: "" });

    const FilterComponents = ({ filters, onChange, onClear}) => {
      const handleSelect = (evt) => {
        let f = filters;
        f.type = evt.target.value === "-1" ? null : evt.target.value;
        onChange(f);
      };
      
      const handleNameChange = (evt) => {
        let f = filters;
        f.name = evt.target.value;
        onChange(f);
      };

      return (
        <div id="filters">
          <span>Report Type: </span>
          <Select
            value={filters?.type ?? ""}
            onChange={handleSelect}
            style={{
              marginRight: "10px",
              marginBottom: "10px",
              appearance: "auto"
            }}
          >
            <option value={-1}>Any</option>
            {["Fleet Boss", "Nestor"].map((type, key) => {
              return (
                <option value={type} key={key} readOnly>
                  {type}
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
          <FontAwesomeIcon fixedWidth icon={faRefresh} /> Refresh Report
        </Button>
      </TableControls>
    )
  })

  let data = [];

  (report?.fc ?? []).forEach((el) => {
    data.push({
      ...el,
      type: "Fleet Boss"
    })
  });
  
  (report?.logi ?? []).forEach((el) => {
    data.push({
      ...el,
      type: "Logi Activity"
    })
  });

  const filteredData = data.filter(
    (row) => 
      row &&
      (!filters.type || row.type == filters.type) &&
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