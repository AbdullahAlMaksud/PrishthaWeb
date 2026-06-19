import React from "react";
import { RenderElementProps, RenderLeafProps } from "slate-react";
import { CustomElement, CustomText } from "./slate-editor";

export const renderSlateElement = (props: RenderElementProps) => {
  const element = props.element as CustomElement;
  const style = {
    textAlign: (element.align || "left") as React.CSSProperties["textAlign"],
  };

  switch (element.type) {
    case "heading-one":
      return (
        <h1 style={style} {...props.attributes}>
          {props.children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...props.attributes}>
          {props.children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 style={style} {...props.attributes}>
          {props.children}
        </h3>
      );
    case "block-quote":
      return (
        <blockquote style={style} {...props.attributes}>
          {props.children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...props.attributes}>
          {props.children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol style={style} {...props.attributes}>
          {props.children}
        </ol>
      );
    case "list-item":
      return (
        <li style={style} {...props.attributes}>
          {props.children}
        </li>
      );
    default:
      return (
        <p style={style} {...props.attributes}>
          {props.children}
        </p>
      );
  }
};

export const renderSlateLeaf = (props: RenderLeafProps) => {
  const leaf = props.leaf as CustomText;
  let { children } = props;

  const style: React.CSSProperties = {};

  if (leaf.fontFamily && leaf.fontFamily !== "default") {
    style.fontFamily = leaf.fontFamily;
  }

  if (leaf.fontSize) {
    style.fontSize = `${leaf.fontSize}px`;
  }

  if (leaf.color) {
    style.color = leaf.color;
  }

  if (leaf.backgroundColor && leaf.backgroundColor !== "transparent") {
    style.backgroundColor = leaf.backgroundColor;
  }

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.code) {
    children = (
      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
  }

  return (
    <span {...props.attributes} style={style}>
      {children}
    </span>
  );
};
