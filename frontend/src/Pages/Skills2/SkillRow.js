import styled from "styled-components";

const Skill = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: wrap;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  gap: 16px;

  .levels {
    box-sizing: border-box;
    display: flex;
    flex-flow: wrap;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: start;
    justify-content: flex-start;
    gap: 0px;

    div {
      margin: 1px;
      height: 8px;
      width: 8px;
      border: 1px solid rgba(204, 204, 204, 0.5);
      transition: ease-in-out 0.3s;
    }

    div.required {
      background: ${(props) => props.theme.colors.danger.color};
      border-color: ${(props) => props.theme.colors.danger.color};
    }

    div.trained {
      background: ${(props) => props.theme.colors.text};
      border-color: ${(props) => props.theme.colors.text};
    }
  }
`;

const SkillRow = ({ mastery, name, current, requirements }) => {
  const Square = ({ _key }) => {
    if (current >= _key) {
      return <div className="trained" />
    }

    let required;
    switch (mastery) {
      case 'gold':
        required = requirements?.gold;
        break;

      case 'elite':
        required = requirements?.elite;
        break;

      case 'basic':
        required = requirements?.min;
        break;

        default:

    }

    if (required && current < required) {
      return <div className="required" />
    }

    return <div />
  }

  return (
    <Skill>
      <div>{name}</div>
      <div className="levels">
        <Square _key={1}/>
        <Square _key={2} />
        <Square _key={3} />
        <Square _key={4} />
        <Square _key={5} />
      </div>
    </Skill>
  )
}

export default SkillRow;
