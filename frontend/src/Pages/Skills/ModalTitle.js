import styled from "styled-components";
import { Button, Buttons } from "../../Components/Form";

const TitleDOM = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: wrap;
  gap: 16px;
  justify-content: space-between;


  > div {
    display: flex;
    align-items: center;

    h2 {
      display: inline;
      font-weight: 700;
      font-size: 26px;
      line-height: 1.35;
      margin: 0px;
    }

    img {
      display: inline;
      border-radius: 35px;
      margin-right: 20px;
    }
  }
`;

const ModalTitle = ({ character, hull, mastery, setMastery }) => {
  return (
   <TitleDOM>
    <div>
      <img src={`https://images.evetech.net/characters/${character.id}/portrait?size=64`} alt='avatar' />
      <h2>{character.name}&apos;s | {hull}</h2>
    </div>
    <Buttons>
      <Button variant={mastery === 'basic' || mastery === 'min' ? 'primary' : null} onClick={e => setMastery('min')}>Basic</Button>
      <Button variant={mastery === 'elite' ? 'primary' : null} onClick={e => setMastery('elite')}>Elite</Button>
      <Button variant={mastery === 'gold' ? 'primary' : null} onClick={e => setMastery('gold')}>Gold</Button>
    </Buttons>
   </TitleDOM>
  )
}

export default ModalTitle;
