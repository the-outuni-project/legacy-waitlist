import styled from "styled-components";

const Skill = styled.div`
  box-sizing: border-box;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  gap: 16px;

  .levels {
    box-sizing: border-box;
    display: flex;
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

    div.trained.not-required {
      background: ${(props) => props.theme.colors.warning.color};
      border-color: ${(props) => props.theme.colors.warning.color};
    }
  }
`;

const SkillRow = ({ mastery, name, current, requirements }) => {
  const requiredLevel = requirements[mastery] ?? 0;
  const Square = ({ _key }) => {
    const isTrained = _key <= current;
    const isRequired = _key <= requiredLevel;

    // if a given level is not required, just color it black.
    // if (!isRequired) return <div />

    if (isTrained && !isRequired) return <div className="trained not-required" />
    if (isTrained) return <div className="trained" />
    if (isRequired) return <div className="required" />
    return <div />
  }

  return (
    <Skill>
      <div>{name}</div>
      <div className="levels" data-tooltip-id="tip" data-tooltip-html={`Current: ${current}<br />Required: ${requiredLevel}`}>
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
export { Skill }
