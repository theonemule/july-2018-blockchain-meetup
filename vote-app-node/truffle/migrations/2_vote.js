var vote = artifacts.require("vote");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(vote);
};