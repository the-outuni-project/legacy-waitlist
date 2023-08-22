import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import styled from "styled-components";
import { Modal } from "../../Components/Modal";
import { Box } from "../../Components/Box";
import { Button } from "../../Components/Form";
import { Skill } from "./SkillRow";

const H2 = styled.h2`
  font-size: 1.5em;

  svg {
    margin-right: 15px;
    font-size: 35px;
  }
`;

const Link = styled.p`
  float: right;
  margin-right: 10px;
  transition: ease-in-out 0.3s;

  &:hover {
    cursor: pointer;
    color: ${(props) => props.theme.colors.highlight.active}
  }
`;

const InlineBox = styled.div`
  display: inline-block;
  margin: 1px;
  height: 8px;
  width: 8px;
  border: 1px solid rgba(204, 204, 204, 0.5);

  &.trained {
    background: ${(props) => props.theme.colors.text};
    border-color: ${(props) => props.theme.colors.text};
  }

  &.required {
    background: ${(props) => props.theme.colors.danger.color};
    border-color: ${(props) => props.theme.colors.danger.color};
  }

  &.trained.not-required {
    background: ${(props) => props.theme.colors.warning.color};
    border-color: ${(props) => props.theme.colors.warning.color};
  }
`;

const SkillsHelp = () => {
  const [ open, setOpen ] = useState(false);

  return (
    <>
      <Link onClick={() => setOpen(true)}>
        <FontAwesomeIcon fixedWidth icon={faInfoCircle} />
        Help
      </Link>
      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>
            <FontAwesomeIcon fixedWidth icon={faInfoCircle}  />
            Skills Help
          </H2>

          <div style={{ marginBottom: '15px', marginTop: '10px' }}>Each <InlineBox className='trained'/> represents a skill level.</div>

          <p>Key: </p>
          <ul style={{ marginBottom: '25px' }}>
            <li><InlineBox /> Not required / trained</li>
            <li><InlineBox className="trained" /> <InlineBox className="trained not-required"/> Trained</li>
            <li><InlineBox className="required"/> Skill required</li>
          </ul>

          <div style={{ marginBottom: '30px'}}>
            <p style={{ marginBottom: '5px' }}>Example of a skill trained to level II that requires level III.</p>
            <Skill>
              <div>Spaceship Command.</div>
              <div className="levels">
                <div className="trained" />
                <div className="trained" />
                <div className="required" />
                <div />
                <div />
              </div>
            </Skill>
          </div>

          <Button variant="primary" onClick={_ => setOpen(false)}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  )
}

export default SkillsHelp;
