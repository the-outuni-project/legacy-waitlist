import { useState } from "react";
import { useContext } from "react";
import { ToastContext } from "../../contexts";

import { Button } from "../../Components/Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { toaster } from "../../api";

const CopyToSkillplan = ({ current, mastery, requirements, skillGroups }) => {
  const toastContext = useContext(ToastContext);
  const [ copied, setCopied ] = useState(false);

  // Build a dictionary of skill IDs to Names
  let skills = {};
  Object.keys(skillGroups)?.forEach(category => {
    skillGroups[category].forEach(skill => {
      skills[skill.id] = skill.name;
    });
  });

  let text = '';
  Object.keys(requirements)?.forEach(skillId => {
    let req = requirements[skillId];
    let skillLevel = req[mastery === 'basic' ? 'min' : mastery];

    if (skillLevel === 1) {
      skillLevel = 'I';
      text += `${skills[skillId]} I\n`;
    }
    else if (skillLevel === 2) {
      skillLevel = 'II';
      text += `${skills[skillId]} II\n`;
    }
    else if (skillLevel === 3) {
      skillLevel = 'III';
      text += `${skills[skillId]} III\n`;
    }
    else if (skillLevel === 4) {
      skillLevel = 'IV';
      text += `${skills[skillId]} IV\n`;
    }
    else if (skillLevel === 5) {
      skillLevel = 'V';
      text += `${skills[skillId]} V\n`;
    }
  });

  const exec = () => {
    setCopied(true);

    toaster(
      toastContext,
      navigator.clipboard
      .writeText((text))
      .then((success) => "Copied to clipboard")
    )

    setTimeout(() => {
      setCopied(false);
    }, 0.5 * 1000);
  }

  return (
    <Button onClick={exec} disabled={copied}>
      Copy Skill Plan <FontAwesomeIcon fixedWidth icon={faCopy} />
    </Button>
  )
}

export default CopyToSkillplan;
