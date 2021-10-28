const Migrations = artifacts.require("Migrations");

const DaiTokenMock = artifacts.require("DaiTokenMock");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(DaiTokenMock);
  const tokenMock = await DaiTokenMock.deployed()
  
  // Mint 1,000 Dai Tokens for the deployer write 1000 then add 18 zeroes
  await tokenMock.mint(
    '0x0172512a113b80974bB2bE062539059a365f0e8c',
    '1000000000000000000000'
  )
};

