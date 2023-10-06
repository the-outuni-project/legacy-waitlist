import _ from "lodash";

const globals = {
  font: {
    family:
      'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    monospaceFamily:
      'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  logo: {},
};

const theme = {
  Dark: _.merge({}, globals, {
    base: "dark",
    logo: {
      filter: "invert(1)",
    },
    colors: {
      background: "#1A1B1E",
      text: "#cccccc",
      active: "#eeeeee",
      lumFactor: 0.6,

      outline: "hsla(213, 100%, 40%, 0.2)",
      modal: "hsla(0, 0%, 0%, 0.80)",
      shadow: "hsla(0, 0%, 0%, 0.5)",

      input: {
        color: "#ffffff0a",
        text: "#cccccc",
        accent: "#ffffff0a",
        disabled: "#999999",
      },
      success: {
        color: "#1f6538",
        text: "white",
        accent: "#226d3c",
        disabled: "#133e22",
      },
      warning: {
        color: "#977c0b",
        text: "white",
        accent: "#b89300",
        disabled: "#574500",
      },
      danger: {
        color: "#a52424",
        text: "white",
        accent: "#b11212",
        disabled: "#330a12",
      },
      primary: {
        color: "#005ca3",
        text: "white",
        disabled: "#cccccc",
        accent: "#002e52",
      },
      secondary: {
        color: "#404040",
        text: "white",
        accent: "#454545",
        disabled: "#202020",
      },
      highlight: {
        text: "#fc9936",
        active: "#ffad5c",
      },

      accent1: "#2e2e2e",
      accent2: "#454545",
      accent3: "#757575",
      accent4: "#ababab",

      shields: {
        orange: "#d67e0d",
        red: "#9a121f",
        green: "#21861e",
        blue: "#105b8b",
        yellow: "#968912",
        purple: "#aa88ff",
        neutral: "#777777",
        cyan: "#1c9493",
        text: "#cccccc",
      },
    },
  }),
  Light: _.merge({}, globals, {
    base: "light",
    colors: {
      background: "#ffffff",
      text: "#4a4a4a",
      active: "#000000",
      lumFactor: 1,

      outline: "hsla(213, 100%, 40%, 0.2)",
      modal: "hsla(0, 0%, 0%, 0.80)",
      shadow: "hsla(0, 0%, 0%, 0.2)",

      input: {
        color: "#2020200d",
        text: "#4a4a4a",
        accent: "2020200d",
        disabled: "#cccccc",
      },
      success: {
        color: "#48c774",
        text: "white",
        accent: "#3ec46d",
        disabled: "#92ddac",
      },
      warning: {
        color: "#ffdd57",
        text: "#4a4a4a",
        accent: "#ffda47",
        disabled: "#cccccc",
      },
      danger: {
        color: "#f14668",
        text: "white",
        accent: "#f03a5f",
        disabled: "#f8a5b6",
      },
      primary: {
        color: "#47afff",
        text: "white",
        accent: "#38a9ff",
        disabled: "#addcff",
      },
      secondary: {
        color: "#e6e6e6",
        text: "#4a4a4a",
        accent: "#dbdbdb",
        disabled: "#cccccc",
      },
      highlight: {
        text: "#0000EE",
        active: "#551A8B",
      },

      accent1: "#fafafa",
      accent2: "#dbdbdb",
      accent3: "#999999",
      accent4: "#666666",

      shields: {
        orange: "#d67e0d",
        red: "#d60015",
        green: "#19b915",
        blue: "#0076c2",
        yellow: "#d2bd00",
        purple: "#aa88ff",
        neutral: "#4b4b4b",
        cyan: "#1eabaa",
        text: "#ffffff"
      },
    },
  }),
};

theme.Purpleholic = _.merge({}, theme.Dark, {
  colors: {
    background: "#290052",
    accent1: "#380070",
    accent2: "#4f009e",
    accent3: "#8c1aff",
    accent4: "#bf80ff",

    secondary: {
      color: "#55008a",
      text: "white",
      accent: "#6e00b3",
      disabled: "#31084a",
    },
  },
});

theme["Deuteranopia"] = _.merge({}, theme.Dark, {
  colors: {
    //#42B1CE
    danger: {
      color: "#e20134",
      text: "#f8f8f8",
      disabled: "#cf4161",
    },
    success: {
      color: "#009F81",
      text: "#12120f",
      disabled: "#e97051",
    },
    warning: {
      color: "#FF633A",
      text: "#010101",
      disabled: "#67b3ee",
    },
    secondary: {
      color: "#008DF9",
      text: "#12120f",
      disabled: "#53978a",
    },
  }
});

Object.keys(theme).forEach((key) => {
  theme[key].name = key;
});

export default theme;
