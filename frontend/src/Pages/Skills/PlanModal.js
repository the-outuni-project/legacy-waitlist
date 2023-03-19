import { useContext } from 'react';
import { AuthContext } from "../../contexts";
import { useApi } from "../../api";
import { Box } from "../../Components/Box";
import { Modal } from "../../Components/Modal";
import Table from "../../Components/DataTable";
import alphaIcon from "../../App/alpha.png";
import styled from "styled-components";
import _ from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const PlanTitle = styled.div`
    img:first-of-type {
        margin-right: 15px;
        vertical-align: middle;
    }

    h4 {
        display: inline;
        font-size: 20px;
    }

    img.alpha {
        padding-bottom: 25px;
    }
`;

const PlanModal = ({ levels, shipId, source, setOpen }) => {
    const authContext = useContext(AuthContext);
    const [ skills ] = useApi(`/api/skills?character_id=${authContext?.current?.id}`);

    if (!authContext || !skills || !levels) {
        return null;
    }

    var skillList = _.invert(skills.ids);

    const columns = [{
      name: "Skill:",
      selector: (row) => (
        <>
          {row.Skill} {row.Required}
        </>
      ),
      grow: 5
    },
    {
      selector: (row) => row.Trained && (<FontAwesomeIcon icon={faCheck} />)
    }];

    let data = [];
    
    const ITR = (i) => {
      switch (i) {
        case 1:
          return 'I';
        case 2:
          return 'II';
        case 3:
          return 'III';
        case 4:
          return 'IV';
        case 5:
          return 'V';
        default:
          return i;
      }
    }

    const HasSkill = (skillId, reqLevel) => {
      return reqLevel <= skills.current[skillId]
    }

    for(let i = 0; i < levels.length; i++) {
      data.push({ 
        Skill: skillList[levels[i][0]],
        Required: ITR(levels[i][1]),
        Trained: HasSkill(levels[i][0], levels[i][1])
      })
    }

    return !authContext ? null : (
        <Modal open={!!source} setOpen={setOpen}>
            <Box>
                <PlanTitle>
                    <img src={`https://images.evetech.net/types/${shipId}/icon`}/>
                    <h4>
                        { source?.name }
                        { source?.alpha && <img src={alphaIcon} title="Alpha clones can fly this ship!" className="alpha" /> }
                    </h4>
                </PlanTitle>

                <Table columns={columns} data={data} paginationPerPage={10} />
            </Box>
        </Modal>
    )
}

export default PlanModal;