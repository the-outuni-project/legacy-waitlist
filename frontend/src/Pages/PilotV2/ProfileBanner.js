import styled from "styled-components";
import { useApi } from "../../api";
import BadgeIcon, { icons } from "../../Components/Badge";
import _ from "lodash";

const Mast = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 0px;
  
  @media (max-width: 400px) {
    flex-direction: column;
  }

  img:first-of-type {
    border-radius: 25px;
    height: 100px;
    margin-right: 15px;
    width: 100px;
    vertical-align: bottom;

    @media (max-width: 400px) {
      margin-right: 0px;
    }
  }

  div:first-of-type {
    display: flex;
    flex-direction: column;

    h1 {
      text-align: center;
      font-size: 1.7em;
      margin: 0px 10px 10px 0px;
    }
  }

  div.tags {
    flex-wrap: flex;

    span {
      margin: 0px 5px 5px;
      svg {
        height: 25px!important;
      }
    }
  }
`;

const PilotTags = ({ tags }) => {
  var _t = [];
  _.forEach(tags, (tag) => {
    if (tag in icons) {
      _t.push(
        <BadgeIcon type={tag} key={tag} />
      )
    }
  })

  return <div className="tags">
    {_t}
  </div>
}

const ProfileBanner = ({ characterId }) => {
  const [ profile ] = useApi(`/api/pilot/info?character_id=${characterId}`);

  return (
    <Mast>
      <img src={`https://images.evetech.net/characters/${profile?.id ?? 1}/portrait?size=128`} alt="Character Portrait" />
      <div>
        <div>
          <h1>{profile?.name}</h1>
        </div>
        <PilotTags tags={profile?.tags} />        
      </div>
    </Mast>
  )
}

export default ProfileBanner;