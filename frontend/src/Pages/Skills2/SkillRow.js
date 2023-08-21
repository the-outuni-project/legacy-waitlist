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

const SkillRow = ({ name, current, requirements }) => {

  return (
    <Skill>
      <div>{name}</div>
      <div className="levels">
        <div className="trained" />
        <div className="required"/>
        <div />
        <div />
        <div />
      </div>
    </Skill>
  )
}

export default SkillRow;
