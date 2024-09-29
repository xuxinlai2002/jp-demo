import React from 'react';
import { OKXTonConnect } from "okxconnect";
import './App.css'; // 确保导入 App.css

const okxTonConnect = new OKXTonConnect({
    metaData: {
        name: "application name",
        icon: "application icon url"
    }
});

const App = () => {
  const handleLogin = () => {
    try {
      okxTonConnect.connect({
          tonProof: "signmessage",
          redirect: "http://192.168.1.3:3000",
          openUniversalLink: true
      })
    } catch (error) {
      if (error instanceof OKXTonConnect.OkxConnectError) {
        if (error.code === OKXTonConnect.OKX_CONNECT_ERROR_CODES.USER_REJECTS_ERROR) {
          console.log('用户拒绝');
        } else if (error.code === OKXTonConnect.OKX_CONNECT_ERROR_CODES.ALREADY_CONNECTED_ERROR) {
          console.log('已经连接');
        } else {
          console.log('发生未知错误');
        }
      } else {
        console.log('发生未知错误');
      }
    }
  };

  return (
    <div className="app-container">
      <button className="okx-wallet-button" onClick={handleLogin}>
        OKX 钱包
      </button>
    </div>
  );
};

export default App;