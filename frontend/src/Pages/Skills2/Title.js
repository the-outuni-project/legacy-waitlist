import styled from "styled-components";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Buttons } from "../../Components/Form";

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

const Title = ({ hull, mastery }) => {
  const queryParams = new URLSearchParams(useLocation().search);
  const history = useHistory();

  const onClick = (mastery) => {
    queryParams.set("mastery", mastery);
    history.push({
      search: queryParams.toString()
    });
  }

  return (
    <TitleDOM>
      <div>
        <h2>{hull}</h2>
      </div>
      <Buttons>
        <Button variant={mastery === 'basic' || mastery === 'min' ? 'primary' : null} onClick={e => onClick('basic')}>Basic</Button>
        <Button variant={mastery === 'elite' ? 'primary' : null} onClick={e => onClick('elite')}>Elite</Button>
        <Button variant={mastery === 'gold' ? 'primary' : null} onClick={e => onClick('gold')}>Gold</Button>
      </Buttons>
    </TitleDOM>
  );
}

export default Title;
