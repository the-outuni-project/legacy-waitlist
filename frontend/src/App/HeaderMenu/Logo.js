import styled from "styled-components";
import logoImage from "../../App/logo.png";

const Brand = styled.img`
  filter: ${(props) => props.theme.logo.filter};
  width: 150px;
`;


export function Logo(props) {
  return  <Brand src={logoImage} {...props} />;
}
