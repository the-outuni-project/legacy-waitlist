import { useContext, useState } from "react";
import { ToastContext } from "../../../../../contexts";
import { apiCall, errorToaster } from "../../../../../api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Box } from "../../../../../Components/Box";
import { Button } from "../../../../../Components/Form";
import { Buttons } from "../../../../../Components/Form";
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

const ClearWaitlist = () => {
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
      apiCall(`/api/waitlist`, {
        method: 'DELETE'
      })
      .then(() => setOpen(false))
      .finally(() => isPending(false))
    );
  }

  return (
    <>
      <Button variant='danger' onClick={_ => setOpen(true)}>Clear Waitlist</Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>
            <FontAwesomeIcon fixedWidth icon={faExclamationCircle} />
            Clear Waitlist
          </H2>
          <p style={{ marginBottom: '25px' }}>Are you sure you want to clear the waitlist? This will affect all fleets.</p>

          <Buttons>
            <Button onClick={_ => setOpen(false)}>Cancel</Button>
            <Button variant='danger' disabled={pending} tabIndex={-1} onClick={handleClick}>Clear the Waitlist</Button>
          </Buttons>
        </Box>
      </Modal>
    </>
  )
}

export default ClearWaitlist;
