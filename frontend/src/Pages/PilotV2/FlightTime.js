import styled from "styled-components";
import Spinner from "../../Components/Spinner";
import { useApi } from "../../api";
import _ from "lodash";
import { duration, formatDuration } from "../../Util/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglassEnd } from "@fortawesome/free-solid-svg-icons";

const DOM = styled.div`
  margin-left: 20px;

  h4 {
    font-size: 1.25em;
    margin-bottom: 15px;
    svg {
      margin-right: 10px;
    }
  }

  div {
    display: flex;
    flex-wrap: wrap;
  }
`;

const ShipDOM = styled.div`
  display: flex;  
  flex-direction: column;
  margin: 0px 10px 10px 0px;
  text-align: center;  

  img {
    border-radius: 25px;
    height: 64px;
    width: 64px;
    margin-left: auto;
    margin-right: auto;
  }

  span {
    color: ${(props) => props.theme.colors.accent4};
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const NotSeen = () => {
  return (
    <DOM>
      <h4>Not seen in fleet before!</h4>
    </DOM>
  );
}

const PilotFlightTime = ({ characterId }) => {
  const [ activity ] = useApi(`/api/history/fleet?character_id=${characterId}`);
  
  if (!activity?.summary) {
    return <div style={{ textAlign: 'center' }}>
      <Spinner />
    </div>
  }

  if (!activity.summary.length) {
    return <NotSeen />
  }

  const flightTime = () => {
    var sum = _.sum(activity.summary.map(({ time_in_fleet }) => time_in_fleet));
    if (sum < 60) return '-';

    let p = [];
    let d = duration(sum);

    if (d.hours) {
      p.push(d.hours + ` hour${d.hours !== 1 ? 's' : ''}`);
    }

    p.push(`${d.minutes ?? 0} minute${d.minutes !== 1 ? 's' : ''}`);       
    
    return p.join(' ');
  }

  return (
    <DOM>
      <h4>
        <FontAwesomeIcon fixedWidth icon={faHourglassEnd} />
        {flightTime()}.
      </h4>
      <div>
        {activity.summary.map(({hull, time_in_fleet}, key) => {
          return (
            <ShipDOM key={key}>
              <img src={`https://images.evetech.net/types/${hull.id}/render?size=64`} alt={hull.name} />
              <span>{hull.name}</span>
              <p>{formatDuration(time_in_fleet)}</p>
            </ShipDOM>
          )
        })}
      </div>
    </DOM>
  )
}

export default PilotFlightTime;