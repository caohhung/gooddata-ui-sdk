// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";

interface IExampleWithSourceProps {
    for: React.ComponentType;
    source: string;
}

export const ExampleWithSource: React.FC<IExampleWithSourceProps> = ({ for: Component, source }) => {
    const [{ hidden }, setState] = useState({ hidden: true });
    const toggle = () => setState(({ hidden: _hidden }) => ({ hidden: !_hidden }));
    const iconClassName = hidden ? "icon-navigatedown" : "icon-navigateup";

    return (
        <div className="example-with-source">
            <style jsx>{`
                .example-with-source {
                    flex: 1 0 auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: stretch;
                    margin-top: 30px;
                }

                .example {
                    padding: 20px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
                    background-color: white;
                }

                .source {
                    margin: 20px 0;
                }

                :global(pre) {
                    overflow: auto;
                }
            `}</style>
            <div className="example">
                <Component />
            </div>
            <div className="source">
                <button
                    className={`gd-button gd-button-secondary button-dropdown icon-right ${iconClassName}`}
                    onClick={toggle}
                >
                    source code
                </button>
                {hidden ? (
                    ""
                ) : (
                    <SyntaxHighlighter language="jsx" style={okaidia}>
                        {source}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
};
