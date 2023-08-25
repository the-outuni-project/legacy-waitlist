import styled from "styled-components";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Buttons } from "../../Components/Form";
import SkillsHelp from "./SkillsHelp";
import { useEffect } from "react";

const TitleDOM = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: wrap;
  gap: 16px;
  justify-content: space-between;

  h2 {
    font-weight: 700;
    font-size: 26px;
    line-height: 1.35;
    margin: 0px;
  }
`;

const StarterHulls = ['Megathron', 'Apocalypse Navy Issue'];

const Title = ({ hull, mastery }) => {
  const queryParams = new URLSearchParams(useLocation().search);
  const history = useHistory();

  const onClick = (mastery) => {
    queryParams.set("mastery", mastery);
    history.push({
      search: queryParams.toString()
    });
  }


  const IsStarterHull = StarterHulls.includes(hull.replace('+', ' '));
  const Tooltip = `The ${hull.replace('+', ' ')} is a starter ship and <br />does not have Elite or Elite Gold skills.`;

  useEffect(() => {
    if (IsStarterHull && (mastery !== 'basic' || mastery !== 'min')) {
      onClick('basic');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IsStarterHull, mastery ])

  return (
    <>
      <TitleDOM>
        <div>
          <h2>{hull}</h2>
        </div>
        <Buttons>
          <Button
            variant={mastery === 'basic' || mastery === 'min' ? 'primary' : null}
            onClick={e => onClick('basic')}
          >
            Basic
          </Button>

          <Button
            variant={mastery === 'elite' ? 'primary' : null}
            onClick={e => onClick('elite')}
            disabled={IsStarterHull}
            data-tooltip-id={IsStarterHull ? 'tip' : null}
            data-tooltip-html={IsStarterHull ? Tooltip : null}
          >
            Elite
          </Button>

          <Button
            variant={mastery === 'gold' ? 'primary' : null}
            onClick={e => onClick('gold')}
            disabled={IsStarterHull}
            data-tooltip-id={IsStarterHull ? 'tip' : null}
            data-tooltip-html={IsStarterHull ? Tooltip : null}
          >
            Gold
          </Button>
        </Buttons>
      </TitleDOM>
      <SkillsHelp />
    </>
  );
}

export default Title;
