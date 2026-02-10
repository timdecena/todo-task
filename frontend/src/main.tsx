import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          fontSize: 18,          // base font size (default is ~14)
          borderRadius: 12,
          padding: 16,
          controlHeight: 44,     // bigger inputs/buttons
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
