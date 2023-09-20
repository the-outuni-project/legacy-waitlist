import { useContext, useState } from "react";
import { ToastContext } from "../../../../../contexts";
import { apiCall, errorToaster } from "../../../../../api";

import { Box } from "../../../../../Components/Box";
import { Button } from "../../../../../Components/Form";
import { Buttons } from "../../../../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../../../../../Components/Modal";

import styled from "styled-components";

const H2 = styled.h2`
  font-size: 1.5em;
  margin-bottom: 25px;

  svg {
    margin-right: 15px;
    font-size: 24px;
  }
`;

const CloseFleet = ({ fleetId }) => {
  const toastContext = useContext(ToastContext);

  const [ open, setOpen ] = useState(false);
  const [ pending, isPending ] = useState(false);

  const handleClick = () => {
    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets/${fleetId}`, {
        method: 'DELETE',
      })
      .then(() => window.location.assign('/fc/fleets'))
      .finally(() => isPending(false))
    );
  }

  return (
    <>
      <Button variant='danger' onClick={_ => setOpen(true)}>Close Fleet</Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>
            <FontAwesomeIcon fixedWidth icon={faExclamationCircle} />
            Close Fleet
          </H2>
          <p style={{ marginBottom: '25px' }}>Are you sure you want to close this fleet? All fleet members will be kicked.</p>

          <Buttons>
            <Button onClick={_ => setOpen(false)}>Cancel</Button>
            <Button variant='danger' disabled={pending} tabIndex={-1} onClick={handleClick}>Kick all members and Close Fleet</Button>
          </Buttons>
        </Box>
      </Modal>
    </>
  )
}

export default CloseFleet;
