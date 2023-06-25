import { useEffect } from "react";

export function usePageTitle(prefix) {
  useEffect(() => {
    let title = document.title;
    replaceTitle(prefix);
    return () => document.title = title;
  });
}

export function replaceTitle(prefix) {
  document.title = `${prefix} | The Outuni Project`;
}

export function parseMarkdownTitle(data) {
  const heading = data.split("\n")[0];
  return heading.substring(heading.indexOf(" "));
}

export function titleCase(title) {
  return (
    title.split(" ")
      .map((word) => word[0].toUpperCase() + word.substr(1).toLowerCase())
      .join(" ")
  );
}
