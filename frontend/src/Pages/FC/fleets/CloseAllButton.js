import { useContext, useState } from "react";
import { AuthContext, ToastContext } from "../../../contexts";
import { apiCall, errorToaster } from "../../../api";

import { Box } from "../../../Components/Box";
import { Button, Buttons } from "../../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../../../Components/Modal";
import styled from "styled-components";

const H2 = styled.h2`
  font-size: 1.5em;
  margin-bottom: 25px;

  svg {
    margin-right: 15px;
    font-size: 35px;
  }
`;

const CloseAllBtn = ({ refreshFunction }) => {
  const authContext = useContext(AuthContext);
  const toastContext = useContext(ToastContext);

  const [ open, setOpen ] = useState(false);
  const [ pending, isPending ] = useState(false);

  // Only fleet admins: Instructor/Leadership should see this
  if (!authContext?.access['fleet-admin']) {
    return null;
  }

  const handleClose = () => {
    if (pending) {
      return; // stop users from clicking this twice
    }
    isPending(true);

    errorToaster(
      toastContext,
      apiCall(`/api/v2/fleets`, {
        method: 'DELETE',
      })
      .then(() => {
        refreshFunction();
        setOpen(false);
      })
      .finally(() => isPending(false))
    );
  }

  return (
    <>
      <Button variant="danger" tabIndex='-1' onClick={_ => setOpen(true)}>
        Close All Fleets
      </Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>
            <FontAwesomeIcon fixedWidth icon={faQuestionCircle} />
            Close all fleets?
          </H2>

          <p style={{ marginBottom: '30px' }}>This will close all fleets and the waitlist. Are you sure you want to continue?</p>

          <Buttons>
            <Button type="submit" tabIndex='1' autoFocus onClick={_ => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="danger" disabled={pending} tabIndex="-1" onClick={handleClose}>
              Yes, Close all Fleets!
            </Button>
          </Buttons>
        </Box>
      </Modal>
    </>
  )
}

export default CloseAllBtn;
