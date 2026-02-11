import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './index.css';

/*
  This file is the frontend entry point that renders the React app into the root DOM element.
  It also sets global Ant Design theme values so UI controls look consistent across the whole app.
*/
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          // Slightly bigger defaults so the app is easy to read.
          fontSize: 18,
          borderRadius: 12,
          padding: 16,
          controlHeight: 44,
        },
        components: {
          Button: {
            controlHeight: 48,
            fontSize: 18,
          },
          Table: {
            fontSize: 18,
            cellPaddingBlock: 16,
            cellPaddingInline: 16,
          },
          Card: {
            paddingLG: 24,
          },
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
