import { network } from "hardhat";
import { OgamaToken } from "../typechain/index.js";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";

const { ethers } = await network.connect();

describe("Token Deployment", function () {
  let token: OgamaToken;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    const Token = (await ethers.getContractFactory(
      "OgamaToken",
    )) as unknown as { deploy: () => Promise<OgamaToken> };

    token = await Token.deploy();

    await token.waitForDeployment();
  });

  it("Owner can mint, non-owner cannot", async () => {
    await token.mint(owner.address, 10n);
    let ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.be.gt(0n);

    await expect(
      token.connect(addr1).mint(addr1.address, 10n),
    ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");

    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(0n);
  });

  it("Check users balance", async () => {
    const ownerBalance = await token.balanceOf(owner.address);
    const addr1Balance = await token.balanceOf(addr1.address);

    expect(ownerBalance).to.be.gt(0n);
    expect(addr1Balance).to.equal(0n);

    console.log("owner balance", ethers.formatUnits(ownerBalance, 18));
    console.log("addr1 balance", ethers.formatUnits(addr1Balance, 18));
  });

  it("Transfer balance", async () => {
    const transferAmount = ethers.parseUnits("50", 18);

    await token.transfer(addr1.address, transferAmount);

    const newOwnerBalance = await token.balanceOf(owner.address);
    const newAddr1Balance = await token.balanceOf(addr1.address);

    console.log("new owner balance", ethers.formatUnits(newOwnerBalance, 18));
    console.log("new addr1 balance", ethers.formatUnits(newAddr1Balance, 18));

    expect(newAddr1Balance).to.be.gt(0n);
  });
});
