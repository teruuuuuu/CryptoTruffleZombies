const Ownable = artifacts.require("ownable");
const SafeMath = artifacts.require("safemath");
const ZombieAttck = artifacts.require("zombieattack");
const ZombieFactory = artifacts.require("zombiefactory");
const ZombieFeeding = artifacts.require("zombiefeeding");
const ZombieHelper = artifacts.require("zombiehelper");
const ZombieOwnersip = artifacts.require("zombieownership");

module.exports = function (deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(SafeMath);

  deployer.link(Ownable, ZombieFactory);
  deployer.deploy(ZombieFactory);

  deployer.link(ZombieFactory, ZombieFeeding);
  deployer.deploy(ZombieFeeding);

  deployer.link(ZombieFeeding, ZombieHelper);
  deployer.deploy(ZombieHelper);

  deployer.link(ZombieHelper, ZombieAttck);
  deployer.deploy(ZombieAttck);

  deployer.link(ZombieAttck, ZombieOwnersip);
  deployer.deploy(ZombieOwnersip);
};
