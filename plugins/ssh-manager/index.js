module.exports = {
  activate: (context) => {
    const { api } = context;
    console.log('SSH Manager plugin activated!');

    // 注册命令到命令面板 (Ctrl+Shift+P)
    api.commands.registerCommand({
      id: 'ssh.new-connection',
      title: 'SSH: New Connection',
      callback: () => {
        api.ui.showInputBox({
          placeholder: 'user@host',
          prompt: 'Enter SSH connection string'
        }).then(connectionString => {
          if (connectionString) {
            api.terminal.createSession({
              name: `SSH: ${connectionString}`,
              command: `ssh ${connectionString}`
            });
          }
        });
      }
    });

    // 注册侧边栏视图
    api.ui.registerView({
      id: 'ssh-manager-view',
      title: 'SSH Manager',
      render: (container) => {
        const savedConnections = [
          { name: 'Production Server', host: '192.168.1.100', user: 'root' },
          { name: 'Dev Box', host: 'localhost', user: 'dev' }
        ];

        container.innerHTML = `
          <div style="padding: 10px;">
            <ul style="list-style: none; padding: 0;">
              ${savedConnections.map(conn => `
                <li style="margin-bottom: 8px; padding: 5px; border: 1px solid #333; cursor: pointer;" class="ssh-item">
                  <strong>${conn.name}</strong><br/>
                  <small>${conn.user}@${conn.host}</small>
                </li>
              `).join('')}
            </ul>
            <button style="width: 100%; margin-top: 10px;">Add New</button>
          </div>
        `;

        container.querySelectorAll('.ssh-item').forEach((el, index) => {
          el.onclick = () => {
            const conn = savedConnections[index];
            api.terminal.createSession({
              name: conn.name,
              command: `ssh ${conn.user}@${conn.host}`
            });
          };
        });
      }
    });
  },
  deactivate: () => {
    console.log('SSH Manager plugin deactivated!');
  }
};