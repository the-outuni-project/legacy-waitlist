import { useContext } from 'react';
import { AuthContext } from "../../contexts";
import { useApi } from "../../api";
import { Box } from "../../Components/Box";
import { Modal } from "../../Components/Modal";
import alphaIcon from "../../App/alpha.png";
import styled from "styled-components";

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

    if (!authContext) {
        return; // must be authenticated to see this modal
    }

    console.log(skills)
        
    return !authContext ? null : (
        <Modal open={!!source} setOpen={setOpen}>
            <Box>
                <PlanTitle>
                    <img src={`https://images.evetech.net/types/${shipId}/icon`}/>
                    <h4>
                        {source?.name}
                        { source?.alpha && <img src={alphaIcon} title="Alpha clones can fly this ship!" className="alpha" /> }
                    </h4>                    
                </PlanTitle>

                { (levels?? []).map((level, key) => {
                    return level[0];
                })}
            </Box>
        </Modal>
    )
}

export default PlanModal;