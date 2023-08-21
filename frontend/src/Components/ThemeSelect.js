import { useState } from "react";
import { Badge } from "./Badge";
import { Button, Radio } from "../Components/Form";
import { Box } from "./Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "./Modal";

import styled from "styled-components";
import themeOptions from "../App/theme.js";

const H2 = styled.h2`
  font-size: 1.5em;

  svg {
    margin-right: 15px;
    font-size: 35px;
  }
`;

const ThemeContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  text-align: left;

  div {
    padding: 10px 45px;
  }

  h4 {
    font-size: large;
    margin-bottom: 15px;

    label, input[type="radio"] {
      cursor: pointer;
    }
  }

  ul.text {
    list-style: none;
    li {
      display: inline-block;
      margin: 0 10px 10px 0px;
      padding: 3px 5px;
      border-radius: 5px;
    }
  }
`;

const ThemeSelect = ({ theme, setTheme }) => {
  const [ open, setOpen ] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <FontAwesomeIcon fixedWidth icon={faPalette} />
      </Button>
      <Modal open={open} setOpen={setOpen}>
        <Box style={{ maxWidth: "700px"}}>
          <H2>
            <FontAwesomeIcon fixedWidth icon={faPalette}  />
            Theme Selector
          </H2>
          <ThemeContainer>
            { Object.keys(themeOptions).map((item, key) => {
              const colors = themeOptions[item].colors;

              const colorMap = {
                primary: colors.primary,
                success: colors.success,
                warning: colors.warning,
                danger: colors.danger,
                secondary: colors.secondary
              }

              return (
                <div key={key}>
                  <h4>
                    <Radio
                      id={item}
                      name="theme"
                      value={item}
                      checked={theme === item}
                      onClick={e => setTheme(e.target.value)}
                    />
                    <label htmlFor={item}>{item} Theme</label>
                  </h4>

                  { Object.keys(colorMap).map((color, key) => {
                    const style = {
                      background: colorMap[color].color,
                      color: colorMap[color].text,
                      margin: '0px 10px 10px 0px'
                    };

                    return (
                      <Badge variant="primary" style={style} key={key}>
                        {color}
                      </Badge>
                    )
                  })}

                  <ul className="text">
                    <li style={{ color: colors.text, background: colors.background  }}>Text Colour</li>
                    <li style={{ color: colors.highlight.active, background: colors.background }}>Hyperlink Colour</li>
                  </ul>
                </div>
              )
            })}
          </ThemeContainer>
          <Button variant="primary" style={{marginLeft: "65px"}} onClick={_ => setOpen(false)}>
            Close
          </Button>
        </Box>
      </Modal>
    </>
  )
}

export default ThemeSelect;
