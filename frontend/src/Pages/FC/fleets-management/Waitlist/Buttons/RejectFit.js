import { useContext, useState } from "react"
import { apiCall, errorToaster } from "../../../../../api";
import { ToastContext } from "../../../../../contexts"

import { Box } from "../../../../../Components/Box";
import { Button } from "./Button";
import { Button as BaseButton, Buttons, Label, Textarea } from "../../../../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../../../../../Components/Modal";

import styled from "styled-components";


const FormGroup = styled.div`
  margin-bottom: 15px;

  textarea, small {
    display: block;
    margin-bottom: 10px;
    min-width: 450px;

    &:not(small) {
      min-height: 150px;
    }
  }
`;

const H2 = styled.h2`
  font-weight: 700;
  font-size: 26px;
  line-height: 1.35;
  margin: 0px;
`;

async function rejectFit(id, review_comment) {
  return await apiCall("/api/waitlist/reject", {
    json: { id, review_comment },
  });
}

const RejectFitButton = ({ fitId, isRejected }) => {
  const toastContext = useContext(ToastContext);

  const [ open, setOpen ] = useState(false);
  const [ reason, setReason ] = useState('');
  const [ pending, isPending ] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    isPending(true);
    errorToaster(
      toastContext,
      rejectFit(fitId, reason)
      .then(_ => {
        setOpen(false);
        setReason('');
      })
      .finally(_ => isPending(false))
    )
  }

  return (
    <>
      <Button type="button"
        variant="primary"
        data-tooltip-id="tip"
        data-tooltip-html={!isRejected ? "Reject Fit" : "Fit already rejected"}
        disabled={isRejected}
        onClick={_ => setOpen(true)}
      >
        <FontAwesomeIcon fixedWidth icon={faTimes} />
      </Button>
      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>Reject Fit</H2>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor={`${fitId}:reject-reason`}>Message to the pilot:</Label>
              <Textarea id={`${fitId}:reject-reason`} value={reason} onChange={e => setReason(e.target.value)} maxLength={512} required />
              <small>{reason?.length ?? 0} of 512 characters.</small>
            </FormGroup>

            <Buttons>
              <BaseButton type="button"
                onClick={() => {
                  setOpen(false);
                  setReason('');
                }}
              >
                Cancel
              </BaseButton>

              <BaseButton variant="danger" disabled={pending}>
                {!pending ? "Reject Fit" : <FontAwesomeIcon fixedWidth icon={faSpinner} spin />}
              </BaseButton>
            </Buttons>
          </form>
        </Box>
      </Modal>
    </>
  )
}

export default RejectFitButton;
