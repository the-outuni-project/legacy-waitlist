import { Burger, Center, Container, createStyles, Group, Header, Menu, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import logoImage from "../../App/logo.png";
import { links } from "./links";
import { Logo } from "./Logo";
import styled from "styled-components";
import A from "../../Components/A";

const StyledHeader = styled(Header)`
  background-color: ${(props) =>  props.theme.colors?.accent1};
  a {
    color: ${(props) => props.theme.colors.text};
  };
`;

const HEADER_HEIGHT = 84;

const useStyles = createStyles((theme) => ({
  inner: {
    height: rem(HEADER_HEIGHT),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    }, 
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 3,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
  },

  linkLabel: {
    marginRight: rem(5),
  },
}));

export function HeaderMenu() {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes } = useStyles();

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <a
              href={link.link}
              className={classes.link}
              onClick={(event) => event.preventDefault()}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size="0.9rem" stroke={1.5} />
              </Center>
            </a> 
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <A
        key={link.label}
        href={link.link}
        className={classes.link}
      >
        {link.label}
      </A>
    );
  });

  return (
    <StyledHeader height={HEADER_HEIGHT}>
      <Container size="xl">
        <div className={classes.inner}>
          <Logo src={logoImage} width={150} height={84} />
          <Group spacing={5} className={classes.links}>
            {items}
          </Group>
          <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
        </div>
      </Container>
    </StyledHeader>
  );
}
