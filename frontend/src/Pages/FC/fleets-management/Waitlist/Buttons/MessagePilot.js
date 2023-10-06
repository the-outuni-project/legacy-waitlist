import { useContext, useState } from "react";
import { ToastContext } from "../../../../../contexts";
import { apiCall, errorToaster } from "../../../../../api";
import { Box } from "../../../../../Components/Box";
import { Button } from "./Button";
import { Button as BaseButton, Buttons, Label, Textarea } from "../../../../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faSpinner } from "@fortawesome/free-solid-svg-icons";
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
`

const H2 = styled.h2`
  font-weight: 700;
  font-size: 26px;
  line-height: 1.35;
  margin: 0px;
`;


async function sendMessage(id, message) {
  return await apiCall("/api/waitlist/message", {
    json: { id, message },
  });
}

const MessagePilot = ({ fitId }) => {
  const toastContext = useContext(ToastContext);

  const [ message, setMessage ] = useState('');
  const [ open, setOpen ] = useState(false);
  const [ pending, isPending ] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    isPending(true);
    errorToaster(
      toastContext,
      sendMessage(fitId, message)
      .then(_ => {
        setMessage('');
        setOpen(false)
      })
      .finally(_ => isPending(false))
    )
  }

  return (
    <>
      <Button type="submit" variant="primary" onClick={_ => setOpen(true)}>
        <FontAwesomeIcon fixedWidth icon={faComment} />
      </Button>

      <Modal open={open} setOpen={setOpen}>
        <Box>
          <H2>Message Pilot</H2>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor={`${fitId}:message`}>Message:</Label>
              <Textarea id={`${fitId}:message`} value={message} onChange={e => setMessage(e.target.value)} maxLength={512} />
              <small>{message?.length ?? 0} of 512 characters.</small>
            </FormGroup>

            <Buttons>
              <BaseButton type="button"
                onClick={() => {
                  setMessage('');
                  setOpen(false);
                }}>
                Cancel
              </BaseButton>

              <BaseButton variant="primary" disabled={pending}>
                {!pending ? "Send Message" : <FontAwesomeIcon fixedWidth icon={faSpinner} spin /> }
              </BaseButton>
            </Buttons>
          </form>
        </Box>
      </Modal>
    </>
  )
}

export default MessagePilot;
