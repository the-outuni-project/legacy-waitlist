import styled from "styled-components";
import SkillRow from "./SkillRow";
import { Button } from "../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import A from "../../Components/A";

const SkillSheet = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(4, minmax(0px, 1fr));
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0px, 1fr));
  }

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0px, 1fr));
  }

  @media (max-width: 770px) {
    grid-template-columns: repeat(1, minmax(0px, 1fr));
  }
`;

const SkillCategory = styled.div`
  display: flex;
  flex-direction: column;
  -webkit-box-align: stretch;
  align-items: stretch;
  -webkit-box-pack: start;
  justify-content: flex-start;
  gap: 10px;
  padding: 16px;

  h3 {
    font-size: 16px;
    line-height: 1.55;
    font-weight: bold;
    text-transform: uppercase;
  }
`;

const CopySkillplan = (current, requirements, mastery) => {
  let text = '';

  Object.keys(requirements).forEach(skillId => {
    const skill = requirements[skillId];
    console.log(skill)
    text += '';
  });

  console.log(requirements, current)
  alert('exec: copy: ', text);
}

const Skills = ({ mastery, selectedHull, skills }) => {
  const { categories, current, ids } = skills ?? {};
  const requirements = skills?.requirements[selectedHull];

  if (!categories || !current || !ids || !requirements) {
    return null;
  }

  const skillGroups = {};
  Object.keys(requirements).forEach((skillId) => {
    // Get the skill name
    const skill = {
      id: Number(skillId),
      // eslint-disable-next-line eqeqeq
      name: Object.keys(ids)?.find(key => ids[key] == skillId) ?? "Unknown Skill",
    };

    // Map the skill to the correct category
    let category = Object.keys(categories)?.find(cat =>  categories[cat].includes(skill.id));

    if (!skillGroups[category]) {
      skillGroups[category] = [];
    }
    skillGroups[category].push(skill)
  });

  return (
    <>
      <Button onClick={e => CopySkillplan(current, requirements, mastery)} disabled>
        Copy Skill Plan <FontAwesomeIcon fixedWidth icon={faCopy} />
      </Button>
      <A href="/skills/plans" style={{ marginLeft: '20px' }}>Legacy Skill Plans</A>
      <SkillSheet>
        { Object.keys(skillGroups).sort().map((category, key) => {
          const skills = skillGroups[category];

          return (
            <SkillCategory key={key}>
              <h3>{category}</h3>
              { skills.sort((a, b) => a.name.localeCompare(b.name)).map((skill, key) => (
                <SkillRow
                  key={key}
                  {...skill}
                  current={current[skill.id]}
                  mastery={mastery}
                  requirements={requirements[skill.id]}
                />
              ))}
            </SkillCategory>
          )
        })}
      </SkillSheet>
    </>
  )
}

export default Skills;
