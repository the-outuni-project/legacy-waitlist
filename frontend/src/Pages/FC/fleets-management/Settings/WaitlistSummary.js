import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Details, Feature } from "./components";
import { faUserClock } from "@fortawesome/free-solid-svg-icons";

const WaitlistSummary = ({ xups }) => {
  let characters = [];
  xups?.forEach(x => {
    x.fits?.forEach(f => {
      if (!characters.includes(f.character.id)) {
        characters.push(f.character.id);
      }
    });
  });

  return (
    <Card>
      <div>
        <Feature>
          <FontAwesomeIcon fixedWidth icon={faUserClock} size="2x" />
        </Feature>
        <Details>
          <p>Waitlist</p>
          <div>
            <p>
              <span data-tooltip-id="tip" data-tooltip-html={`${xups?.length} users on WL`}>{xups?.length}</span>
              &nbsp; // &nbsp;
              <span data-tooltip-id="tip" data-tooltip-html={`${characters?.length} characters on WL`}>{characters?.length}</span>
            </p>
          </div>
        </Details>
      </div>
    </Card>
  )
}

export default WaitlistSummary;
