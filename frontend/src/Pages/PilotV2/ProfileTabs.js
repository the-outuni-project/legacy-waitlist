import { useContext } from "react";
import { AuthContext } from "../../contexts";
import { useQuery } from "../../Util/query";
import styled from "styled-components";

const Tabs = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 15px;
  overflow: hidden;  

  button {
    background-color: inherit;
    border: none;
    color:  ${(props) => props.theme.colors.text};
    cursor: pointer;
    flex-grow: 1;
    font-size: 17px;
    outline: none;
    padding: 14px 16px;
    transition: 0.3s;
    
    &:hover:not(:disabled) {
      background: ${(props) => props.theme.colors.accent1};
    }

    &.active {
      border-bottom: 2.5px solid ${(props) => props.theme.colors.primary.color};
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
`;

const ProfileTabs = () => {
  const authContext = useContext(AuthContext);
  const [ { tab = 'characters' } , setQuery ] = useQuery();

  const Button = ({ id, children, disabled = false }) => {
    return <button id={id}
      className={tab === id ? 'active' : null}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  }

  const handleClick = (e) => {
    e.preventDefault(e);
    setQuery('tab', e.target.id, true);
  }

  return (
    <Tabs>
      <Button id='characters'>Characters</Button>
      <Button id='fits' disabled>Fits</Button>
      <Button id='settings' disabled>Settings</Button>    
      { authContext.access['waitlist-tag:HQ-FC'] && <Button id='comments' disabled>Comments</Button> }
      <Button id='skills' disabled>Skills</Button>
    </Tabs>
  )
}

export default ProfileTabs;