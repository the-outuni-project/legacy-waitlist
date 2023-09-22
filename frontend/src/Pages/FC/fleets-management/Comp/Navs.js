import styled from "styled-components";
import { Badge as BaseBadge } from "../../../../Components/Badge";

const Badge = styled(BaseBadge)`
  border-radius: 12px;
  margin-left: 5px;
  font-size: 10px;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 15px;
  margin-bottom: 10px;
  overflow: hidden;

  button {
    background-color: inherit;
    border: none;
    color:  ${(props) => props.theme.colors.text};
    cursor: pointer;
    flex-grow: 1;
    font-size: 17px;
    outline: none;
    padding: 6px 5px;
    transition: 0.3s;

    &:hover:not(:disabled) {
      background: ${(props) => props.theme.colors.accent1};
    }

    &.active {
      border-bottom: 3px solid ${(props) => props.theme.colors[props.variant].color};
    }

    &:disabled {
      cursor: not-allowed;
    }
  }
`;


const Navs = ({ categories = [], activeTab, tabVariant = 'primary', onClick }) => {
  categories = categories?.filter(cat => cat.id !== 'alt');

  const Button = ({ id, name, count }) => {
    return <button className={id === activeTab ? 'active' : null} onClick={_ => onClick(id)}>
      {name}
      <Badge variant="secondary">
        {count ?? '-' }
      </Badge>
    </button>
  }

  return (
    <Tabs variant={tabVariant}>
      { categories?.map((category, key) => {
        let count = 0;

        category?.ships.forEach(ship => {
          count += ship?.pilots.length;
        })

        return <Button {...category} count={count} key={key} />
      })}
    </Tabs>
  )
}

export default Navs;
