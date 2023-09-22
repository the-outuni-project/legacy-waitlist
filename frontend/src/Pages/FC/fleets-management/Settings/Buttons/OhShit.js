import { useContext, useState } from "react";
import { ToastContext } from "../../../../../contexts";
import { apiCall, errorToaster } from "../../../../../api";
import { Button, Buttons, Switch } from "../../../../../Components/Form";
import { Modal } from "../../../../../Components/Modal";
import { Box } from "../../../../../Components/Box";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const H2 = styled.h2`
  font-size: 1.5em;
  margin-bottom: 25px;

  svg {
    margin-right: 15px;
    font-size: 24px;
  }
`;

const OhShit = ({ fleetId }) => {
  const toastContext = useContext(ToastContext);

  const [ open, setOpen ] = useState(false);
  const [ toggle, setToggle ] = useState(false);
  const [ pending, isPending ] = useState(false);

  const handleClick = () => {
    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets/${fleetId}/actions/oh-shit`, {
        method: 'POST',
      })
      .finally(() => isPending(false))
    );
  }

  return (
    <>
      <Button outline variant='warning' tabIndex={-1} disabled={pending} onClick={_ => setOpen(true)}>Oh, Shit!</Button>
      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>
            <FontAwesomeIcon fixedWidth icon={faBell} />
            Emergency Logi Invite
          </H2>
          <p style={{ marginBottom: '25px'}}>
            SET SAFETY TO RED: &nbsp; <Switch checked={toggle} variant="danger" onChange={setToggle} />
          </p>

          <Buttons style={{ marginTop: '15px'}}>
            <Button onClick={_ => setOpen(false)}>Cancel</Button>
            <Button
              variant="warning"
              tabIndex="-1"
              onClick={handleClick}
              disabled={!toggle}
            >
              Send Emergency Invite
            </Button>
          </Buttons>
        </Box>
      </Modal>
    </>
  )
}

export default OhShit;
