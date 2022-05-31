import type { LoaderContext } from 'webpack';

export type Options = {
  // which webpack alias to use for vue path replaces
  alias: string;
  // github edit url
  openTarget?: string;
};

/**
 * transform vue component to source code
 * @param {string} source
 * @returns with props Sandpack
 */
export default function (this: LoaderContext<Options>, source: string): string {
  // use resourcePath to mastch current file Path
  // format: @alias/path-file.ext
  const { resourcePath, getOptions, mode } = this;
  const { alias, openTarget } = getOptions();

  // deal filepath due to windows \ -> /
  const filePath = resourcePath?.replace(alias ?? '', '')?.replace(/\\/g, '/');

  const dependencies = {
    '@taro-hooks/plugin-vue':
      mode === 'development'
        ? 'node_modules/@taro-hooks/plugin-vue/index.js'
        : 'latest',
  };

  return `
  import React from 'react';
  import CodeBlock from '@theme/CodeBlock';
  import { Sandpack } from '@taro-hooks/sandpack';
  import {useColorMode} from '@docusaurus/theme-common';
  import BrowserOnly from '@docusaurus/BrowserOnly';

  export default () => {
    const {colorMode} = useColorMode();

    return (
      <BrowserOnly>
      {
        () => {
          const sandpackCss = window.location.origin + '/style/sandpack.css';
          return (
            <Sandpack
              frameWork="vue3"
              code={\`${source}\`}
              filePath="${filePath}"
              editUrl="${openTarget}${filePath}"
              dependencies='${JSON.stringify(dependencies)}'
              externalResources={[sandpackCss]}
              theme={colorMode}
              fallback={<CodeBlock language="html" title="${filePath}" showLineNumbers>{\`${source}\`}</CodeBlock>}
            />
          )
        }
      }
      </BrowserOnly>
    )
  }
  `;
}