import styled from "styled-components";
import { Badge as BaseBadge } from "../../../../Components/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faHourglass } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const Badge = styled(BaseBadge)`
  border-radius: 25px;

  svg {
    margin-right: 7.5px;
  }

  &.fleet-time, &.wait-time {
    svg path {
      color: ${(props) => props.theme.colors.primary.text};
    }
  }

  &.fleet-time {
    color: ${(props) => props.theme.colors.secondary.text};
    background: ${(props) => props.theme.colors.secondary.color};
  }
`;
const WaitTimeDOM = styled.div`
  // align-items: center;
  display: flex;
  font-weight: 500;
  font-size: 18px;
`;

const TotalFleetTime = ({ hours = 0 }) => {
  if (hours < 1) {
    return null;
  }

  return (
    <Badge className="fleet-time" data-tooltip-id="tip" data-tooltip-html="Hours in Fleet">
      <FontAwesomeIcon fixedWidth icon={faClock} />
      { hours } H
    </Badge>
  )
}

const WaitTime = ({ joined_at }) => {
  const [ time, setTime ] = useState(Date.now() / 1000);

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now() / 1000), 1000 * 15);
    return () => {
      clearInterval(interval);
    }
  }, [])

  const totalSeconds = time - joined_at;
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);

  let label = '';
  if (hours > 0) {
    label += `${hours}H `;
  }
  label += `${minutes}M`;

  return (
    <WaitTimeDOM data-tooltip-id="tip" data-tooltip-html={`On the waitlist for ${label}`}>
      <Badge className="wait-time">
        <FontAwesomeIcon fixedWidth icon={faHourglass} />
        { label }
      </Badge>
    </WaitTimeDOM>
  )
}

export { TotalFleetTime, WaitTime }
