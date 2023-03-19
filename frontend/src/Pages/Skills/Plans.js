import { useApi } from "../../api";
import { usePageTitle } from "../../Util/title";
import Spinner from "../../Components/Spinner";
import styled from "styled-components";
import alphaIcon from "../../App/alpha.png";
import A from "../../Components/A";

const Header = styled.div`
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;

  h1 {
    font-size: 32px;
  }
`;

const H2 = styled.h2`
  font-size: 26px;
`;

const PlanSummaryCard = styled.a`
  background-color: ${(props) => props.theme.colors.accent1};

  &:hover {
    background-color: ${(props) => props.theme.colors.accent2};
  }

  border-radius: 5px;  
  color: unset;
  cursor: pointer;
  display: flex;   
  margin: 0px 10px 10px 0px;
  padding: .5em;
  position: relative;
  width: 25vw;
  max-width: 450px;
  text-decoration: none;

  @media (max-width: 1600px) {
    width: 45vw;
  }

  @media (max-width: 800px) {
    width: 95vw;
  }

  
  @media (max-width: 450px) {
    flex-direction: column;
    align-items: center;

    .alpha {
      left: 55%!important;
    }
  }

  img:first-of-type {
    vertical-align: middle;
    margin-right: 20px;
  }

  .alpha {
    position: absolute;
    top: 55px;
    left: 55px;
    height: 30px;
    width: 30px;
  }

  h3 {
    display: inline;
    font-size: 18px;
    margin-right: 5px;
  }
`;

const PlanSummary = ({ ships, source, href }) => {
  {source.name === "TII Blasters" && (
    <img src={`https://images.evetech.net/types/3186/icon`} />
  )}
  {source.name === "TII Lasers" && (
    <img src={`https://images.evetech.net/types/3057/icon`} />
  )}
  let imgSrc = `https://images.evetech.net/types/${ships[0]?.id}/icon`;
  if (!ships[0]) {
    let id = source.name === "TII Blasters" ? 3186 : 3057;
    imgSrc = `https://images.evetech.net/types/${id}/icon`;
  }
  return (
    <PlanSummaryCard href={href}>
      <div style={{ width: "70px", display: "relative" }}>
        <img src={imgSrc} className="icon" />
        {source.alpha && (
        <img src={alphaIcon} title="Alpha clones can fly this ship!" className="alpha" />
      )}
      </div>
      
      <div style={{ display: "inline" }}>
        <h3>{source.name}</h3>
        <p>{source.description !== "~" && source.description}</p>
      </div>
    </PlanSummaryCard>
  );  
}

const Plans = () => {
    const [ skillPlans ] = useApi(`/api/skills/plans`);
    
    usePageTitle("Skill Plans");

    const UrlHelper = (u) => {
      u = u.toLowerCase();
      return `/skills/plans/` + u.replace(/ /g, '-');
    }
      
    return (
        <>
          <Header>
            <h1>Skill Plans</h1>
          </Header>

          {!skillPlans ? <Spinner /> : (
            <>
              <p style={{ paddingBottom: "15px" }}>
                Minimum Skills:  Armor compensation II (starter fits) or IV (all other fits) &amp; the skills to use your fit.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap"}}>
              {skillPlans?.filter(plan => plan.source.tier === "Minimum")?.map((plan, key) => {
                  return <PlanSummary {...plan} key={key} href={UrlHelper(plan.source.name)} />
              })}
              </div>
              
              <H2>Weapon Plans</H2>
              <div style={{ display: "flex", flexWrap: "wrap"}}>
                {skillPlans?.filter(plan => plan.source.tier === "Weapon")?.map((plan, key) => {
                  return <PlanSummary {...plan} key={key} href={UrlHelper(plan.source.name)} />
                })}
              </div>

              <H2>Elite Plans</H2>
              <p style={{ paddingBottom: "15px" }}>
                You are required to reach <b>Elite</b> status within 225 hours in fleet. Elite status requires elite fit, implants &amp; skills. You can check your hours on your <A href="/pilot">profile page</A>.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap"}}>
                {skillPlans?.filter(plan => plan.source.tier === "Elite")?.map((plan, key) => {
                  return <PlanSummary {...plan} key={key} href={UrlHelper(plan.source.name)} />
                })}
              </div>
            </>
          )}
        </>
    );
};

export default Plans;