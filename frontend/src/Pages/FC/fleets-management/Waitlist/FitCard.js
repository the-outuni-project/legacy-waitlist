import { useState } from "react";
import BadgeIcon from "../../../../Components/Badge";
import RemoveFit from "./Buttons/RemoveFit";
import ShowInfo from "./Buttons/ShowInfo";
import styled from "styled-components";
import ViewProfile from "./Buttons/ViewProfile";
import ViewSkills from "./Buttons/ViewSkills";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faComment, faTimes } from "@fortawesome/free-solid-svg-icons";
import FitModal from "./FitModal";

const FitCardDOM = styled.div`
  display: flex;
  border-radius: 10px;
  background: ${(props) => props.theme.colors[props.variant]?.accent};
  position: relative;
  width: 370px;
  height: 110px;
  margin-bottom: 5px;
  margin-right: 5px;



  div.grey {
    background: ${(props) => props.theme.colors.accent1};
    border-radius: 0px 0px 10px 10px;
    position: absolute;
    bottom: 0;
    height: 50%;
    width: 100%;
  }
`;

const ImageContainerDOM = styled.div`
  position: relative;
  height: 90px;
  width: 90px;
  user-select: none;
  display: inline-block;

  img.hull {
    border-radius: 50%;
    height: 80px;
    position: absolute;
    top: 15px;
    left: 5px;
    bottom: 15px;
    z-index: 100;

    &:hover {
      cursor: pointer;
    }
  }

  img.character {
    border-radius: 50%;
    height: 40px;
    bottom: -10px;
    right: 0px;
    position: absolute;
    z-index: 101;

    &:hover {
      cursor: pointer;
    }
  }
`;

const ContentContainerDOM = styled.div`
  display: flex;
  flex-direction: column;
  div.names {
    display: flex;
    flex-direction: row;
    div:first-of-type {
      flex-grow: 1;
    }
  }
  div.buttons {
    z-index: 103;
    padding-left: 10px;

    button {
      margin-right: 5px;
      margin-bottom: 7px;
    }

    p {
      font-size: 12px;
      margin-right: 30px;
    }
  }
  flex-grow: 1;
  justify-content: space-between;

  p {
    &:first-of-type {
      border-bottom: 2px solid ${(props) => props.theme.colors.text};
    }
    &:last-of-type {
      font-size: smaller;
      font-style: italic;
    }
  }
`;

const BadgeContainerDOM = styled.div`
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 5px;
  min-width: 25px;
  user-select: none;
`;

const FitState = ({ state, review_comment }) => {
  switch (state) {
    case 'approved':
      return 'success';

    case 'rejected':
      return 'danger';

    default:
      return 'warning';
  }
}

const IMAGE_SERVER_URL = 'https://images.evetech.net/';

const FitCard = ({ fit }) => {
  const BadgeContainer = ({ tags }) => {
    const badges = [
      'LOGI',
      'BASTION',
      'WEB',
      'ELITE',
      'ELITE-GOLD'
    ];

    const tag = tags?.find(t => badges.includes(t));

    return (
      <BadgeContainerDOM>
        {tag ? <BadgeIcon type={tag} /> : null}
      </BadgeContainerDOM>
    )
  }
  const ImageContainer = ({ character, hull }) => {
    const [ open, setOpen ] = useState(false);
    return (
      <ImageContainerDOM>
        <img
          className='hull'
          src={ IMAGE_SERVER_URL + `types/${hull?.id ?? 1}/icon?size=128` }
          alt={character?.name ?? 'Unknown Pilot'}
          onClick={_ => setOpen(true)}
        />
        <img
          className='character'
          src={ IMAGE_SERVER_URL + `characters/${character?.id ?? 1}/portrait?size=64`}
          alt={character?.name ?? 'Unknown Pilot'}
          onClick={_ => setOpen(true)}
        />
        <FitModal fit={fit} open={open} setOpen={setOpen} />
      </ImageContainerDOM>
    )
  }

  const ContentContainer = ({ character, fit_analysis, id, tags }) => {
    const ALLOWED_TAGS = [
      'NO-EM-806',
      'SLOW',
      'STARTER',
      'UPGRADE-HOURS-REACHED',
      'ELITE-HOURS-REACHED'
    ];

    tags = tags.filter(tag => ALLOWED_TAGS.includes(tag));

    return (
      <ContentContainerDOM>
        <div className="names">
          <div>
            <p>{character?.name ?? 'Unknown'}</p>
            <p>{fit_analysis?.name}</p>
          </div>
          <BadgeContainer tags={fit?.tags} />
        </div>
        <div className="buttons">
          <p>
            { tags?.join(', ')}
          </p>

          <RemoveFit fitId={id} />
          <ShowInfo {...character} />
          <ViewSkills character={character} hull={fit?.hull} />
          <ViewProfile {...character} />

          <button>
            <FontAwesomeIcon fixedWidth icon={faComment} />
          </button>

          <button>
            <FontAwesomeIcon fixedWidth icon={faTimes} />
          </button>

          <button>
            <FontAwesomeIcon fixedWidth icon={faCheck} />
          </button>
        </div>
      </ContentContainerDOM>
    )
  }
  console.log(fit)
  return (
    <FitCardDOM variant={FitState(fit)}>
      <ImageContainer character={fit?.character} hull={fit.hull} />
      <ContentContainer {...fit} />
      <div className='grey' />
    </FitCardDOM>
  )
}

export default FitCard;
