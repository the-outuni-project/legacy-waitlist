import { useContext, useState } from "react";
import { ToastContext } from "../../../../contexts";
import { apiCall, errorToaster } from "../../../../api";

import { Box } from "../../../../Components/Box";
import { Button, Buttons } from "../../../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FitDisplay } from "../../../../Components/FitDisplay";
import { Modal } from "../../../../Components/Modal"
import { Title } from "../../../../Components/Page";
import { SkillDisplay } from "../../../../Components/SkillDisplay";

async function approveFit(id) {
  return await apiCall("/api/waitlist/approve", {
    json: { id: id },
  });
}

async function rejectFit(id, review_comment) {
  return await apiCall("/api/waitlist/reject", {
    json: { id, review_comment },
  });
}

const FitModal = ({ fit, open, setOpen }) => {
  const toastContext = useContext(ToastContext);
  const [ acceptPending, isAcceptPending ] = useState(false);
  const [ rejectPending, isRejectPending ] = useState(false);

  if (!fit) {
    return null; // this modal cannot load until a fit is supplied
  }

  const handleApproveClick = () => {
    isAcceptPending(true);

    errorToaster(
      toastContext,
      approveFit(fit.id).then(setOpen(false)).finally(isAcceptPending(false))
    );
  }

  const handleRejectClick = () => {
    var reason = prompt("Why is the fit being rejected? (Will be displayed to pilot)");
    if (reason) {
      isRejectPending(true);

      errorToaster(
        toastContext,
        rejectFit(fit.id, reason).then(setOpen(false)).finally(isRejectPending(false))
      );
    }
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <Box>
        <Buttons>
          <Button variant="success" onClick={handleApproveClick} style={{ minWidth: '91px' }} disabled={acceptPending} pending={acceptPending}>
            { !acceptPending ? "Approve" : <FontAwesomeIcon fixedWidth icon={faSpinner} spin /> }
          </Button>
          <Button variant="danger" onClick={handleRejectClick} style={{ minWidth: '91px' }} disabled={rejectPending} pending={rejectPending}>
          { !acceptPending ? "Reject" : <FontAwesomeIcon fixedWidth icon={faSpinner} spin /> }
          </Button>
        </Buttons>

        <FitDisplay fit={fit} />
        { fit.tags.includes("STARTER") && (
          <>
            <Title>Starter Skills</Title>
            <SkillDisplay characterId={fit.character.id} ship={fit.hull.name} filterMin />
          </>
        )}
      </Box>
    </Modal>
  )
}

export default FitModal;
