// https://eth-ropsten.alchemyapi.io/v2/WEIKwSCroGfmGl3pJt7J80RnhC2ysj7z

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/WEIKwSCroGfmGl3pJt7J80RnhC2ysj7z',
      accounts: ['']
    }
  }
}