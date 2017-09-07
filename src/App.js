import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import ReactMarkdown from 'react-markdown';
import assign from 'lodash.assign';
import Editor from './editor.js';
import CodeBlock from './code-block.js';

import logo from './logo.svg';
import './App.css';

require('highlight.js/styles/monokai.css');

const fs = window.require('fs');
const electron = window.require('electron');
const ipc = electron.ipcRenderer;
const remote = electron.remote;
const dialog = remote.dialog;

class App extends Component {
  constructor(props) {
    super();

    ipc.on('file-opened', (event, file, content) => {
      this.setState({
        markdownSrc: content
      });
    });

    ipc.on('save-file', (event) => {
      dialog.showSaveDialog((filename) => {
        if(filename == undefined){
          alert("Error while saving");
          return;
        }

        var content = this.state.markdownSrc;

        fs.writeFile(filename, content, (err) => {
          if (err) console.log(err);
          alert("The file has been successfully saved.");
        })
      });
    });

    this.state = {
      markdownSrc: [
        '# Live demo\n\nChanges are automatically rendered as you type.\n\n* Follows the ',
        '[CommonMark](http://commonmark.org/) spec\n* Renders actual, "native" React DOM ',
        'elements\n* Allows you to escape or skip HTML (try toggling the checkboxes above)',
        '\n* If you escape or skip the HTML, no `dangerouslySetInnerHTML` is used! Yay!\n',
        '\n## HTML block below\n\n<blockquote>\n    This blockquote will change based ',
        'on the HTML settings above.\n</blockquote>\n\n## How about some code?\n',
        '```js\nvar React = require(\'react\');\nvar Markdown = require(\'react-markdown\');',
        '\n\nReact.render(\n    <Markdown source="# Your markdown here" />,\n    document.',
        'getElementById(\'content\')\n);\n```\n\nPretty neat, eh?\n\n', '## More info?\n\n',
        'Read usage information and more on [GitHub](//github.com/rexxars/react-markdown)\n\n',
        '---------------\n\n',
        'A component by [VaffelNinja](http://vaffel.ninja) / Espen Hovlandsdal'
      ].join(''),
      htmlMode: 'raw'
    };

    this.onMarkdownChange = this.onMarkdownChange.bind(this);
    this.onControlsChange = this.onControlsChange.bind(this);
  }

  onMarkdownChange(md) {
    this.setState({
      markdownSrc: md
    });
  }

  onControlsChange(mode) {
    this.setState({ htmlMode: mode });
  }

  render() {
    return (
      <div className="App">
        <SplitPane split="vertical" defaultSize="50%">
          <div className="editor-pane">
            <Editor className="editor" value={this.state.markdownSrc} onChange={this.onMarkdownChange}/>
          </div>
          <div className="view-pane">
            <ReactMarkdown className="result"
              source={this.state.markdownSrc}
              skipHtml={this.state.htmlMode === 'skip'}
              escapeHtml={this.state.htmlMode === 'escape'}
              renderers={assign({}, ReactMarkdown.renderers, {CodeBlock: CodeBlock})}
            />
          </div>
        </SplitPane>
      </div>
    );
  }
}

export default App;
