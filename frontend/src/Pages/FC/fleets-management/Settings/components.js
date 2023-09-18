import styled from "styled-components";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Card = styled.div`
  color: rgb(193, 194, 197);
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.accent3};
  border-radius: 16px;
  box-shadow: none;
  outline: 0px;
  padding: 10px;
  user-select: none;
  text-decoration: none;

  > div {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
  }
`;

const Feature = styled.div`
  border: 0;
  border-radius: 32px;
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  position: relative;
  height: 38px;
  min-width: 38px;
  width: 38px;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const Details = styled.div`
  flex-grow: 1;

  p {
    color: ${(props) => props.theme.colors.text.color};
    font-size: smaller;
    text-transform: uppercase;
  }

  div {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;

    button {
      appearance: none;
      border: 1px solid transparent;
      background-color: transparent;
      box-sizing: border-box;
      cursor: pointer;
      color: rgb(233, 236, 239);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 16px;
      min-height: 16px;
      min-width: 16px;
      width: 16px;
    }
  }
`;


const Button = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <FontAwesomeIcon fixedWidth icon={faPencilAlt} />
    </button>
  )
}

export { Button, Card, Details, Feature };
