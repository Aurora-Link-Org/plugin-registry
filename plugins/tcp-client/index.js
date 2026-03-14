module.exports = {
  activate: (context) => {
    console.log('TCP Client plugin activated!');
    // 在这里编写 TCP 客户端的核心逻辑
  },
  deactivate: () => {
    console.log('TCP Client plugin deactivated!');
  }
};
