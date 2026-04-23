import { AppRegistry } from 'react-native';
import { createRoot } from 'react-dom/client';

import { RnwApp } from './RnwApp.jsx';
import './styles.css';

AppRegistry.registerComponent('SDRSRnw', () => RnwApp);

const rootNode = document.getElementById('root');
const root = createRoot(rootNode);
const { element, getStyleElement } = AppRegistry.getApplication('SDRSRnw');

root.render(
  <>
    {getStyleElement()}
    {element}
  </>,
);
