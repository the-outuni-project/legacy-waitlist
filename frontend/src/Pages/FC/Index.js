import React from "react";
import { NavLink } from "react-router-dom";
import { PageTitle } from "../../Components/Page";
import { AuthContext } from "../../contexts";
import { Card, CardArray, CardMargin } from "../../Components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faShieldAlt,
  faUserShield,
  faBullhorn,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { usePageTitle } from "../../Util/title";

const guideData = {};
function importAll(r) {
  r.keys().forEach((key) => (guideData[key] = r(key)));
}
importAll(require.context("./guides", true, /\.(md|jpg|png)$/));

function GuideCard({ icon, slug, name, children }) {
  return (
    <CardMargin>
      <NavLink style={{ textDecoration: "inherit", color: "inherit" }} exact to={`/fc/${slug}`}>
        <Card
          title={
            <>
              <FontAwesomeIcon fixedWidth icon={icon} /> {name}
            </>
          }
        >
          <p>{children}</p>
        </Card>
      </NavLink>
    </CardMargin>
  );
}

export function FCMenu() {
  const authContext = React.useContext(AuthContext);
  usePageTitle("FC Menu");
  return (
    <>
      <PageTitle>FC Dashboard</PageTitle>
      <CardArray>
        {authContext && authContext.access["waitlist-tag:HQ-FC"] && (
          <GuideCard slug="announcements" name="Announcements" icon={faBullhorn} />
        )}
        {authContext && authContext.access["bans-manage"] && (
          <GuideCard slug="bans" name="Bans" icon={faBan} />
        )}
        {authContext && authContext.access["badges-manage"] && (
          <GuideCard slug="badges" name="Badges" icon={faShieldAlt} />
        )}
        {authContext && authContext.access["commanders-view"] && (
          <GuideCard slug="commanders" name="Commanders" icon={faUserShield} />
        )}
        {authContext && authContext.access["stats-view"] && (
          <GuideCard slug="stats" name="Statistics" icon={faChartLine} />
        )}
      </CardArray>
    </>
  );
}
