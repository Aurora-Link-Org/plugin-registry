module.exports = {
  activate: (context) => {
    const { api } = context;
    console.log('TCP Client plugin activated!');

    // 注册侧边栏面板
    api.ui.registerPanel({
      id: 'tcp-client-panel',
      title: 'TCP Client',
      icon: 'network',
      render: (container) => {
        container.innerHTML = `
          <div style="padding: 10px;">
            <h3>TCP Connection</h3>
            <input id="tcp-host" placeholder="Host (e.g. 127.0.0.1)" style="width: 100%; margin-bottom: 5px;" />
            <input id="tcp-port" placeholder="Port" type="number" style="width: 100%; margin-bottom: 10px;" />
            <button id="tcp-connect" style="width: 100%;">Connect</button>
            <div id="tcp-status" style="margin-top: 10px; font-size: 12px; color: #888;">Disconnected</div>
            <hr />
            <textarea id="tcp-send-data" placeholder="Data to send..." style="width: 100%; height: 60px;"></textarea>
            <button id="tcp-send" style="width: 100%; margin-top: 5px;">Send</button>
          </div>
        `;

        const connectBtn = container.querySelector('#tcp-connect');
        const statusDiv = container.querySelector('#tcp-status');
        
        connectBtn.onclick = () => {
          const host = container.querySelector('#tcp-host').value;
          const port = container.querySelector('#tcp-port').value;
          statusDiv.innerText = `Connecting to ${host}:${port}...`;
          
          // 模拟 TCP 连接逻辑
          setTimeout(() => {
            statusDiv.innerText = `Connected to ${host}:${port}`;
            statusDiv.style.color = '#4caf50';
          }, 1000);
        };
      }
    });
  },
  deactivate: () => {
    console.log('TCP Client plugin deactivated!');
  }
};