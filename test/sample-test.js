const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { BigNumber } = require("ethers");

  function convert(number) {
    return ethers.BigNumber.from(number).toNumber();
    
  }

describe("Testing", () => {
    let owner, factory, router, tokenA, tokenB, wETH,Pair,pair,liquidityToken;

    beforeEach(async () => {
        [owner,signer1] = await ethers.getSigners();
        amountA = 10000;
        amountB = 10000;

        const TokenA = await ethers.getContractFactory("TokenA");
        const TokenB = await ethers.getContractFactory("TokenB");
        const WETH = await ethers.getContractFactory("WETH");
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        Pair = await ethers.getContractFactory("UniswapV2Pair");
        const LiquidityToken = await ethers.getContractFactory("UniswapV2ERC20");

        factory = await Factory.deploy(owner.address);
        await factory.deployed();
        tokenA = await TokenA.deploy();
        await tokenA.deployed();
        tokenB = await TokenB.deploy();
        await tokenB.deployed();
        wETH = await WETH.deploy();
        await wETH.deployed();
        pair = await Pair.deploy();
        await pair.deployed();
        liquidityToken = await LiquidityToken.deploy();
        liquidityToken.deployed();

        await tokenA.mintToken(signer1.address,10000);
        await tokenB.mintToken(signer1.address,10000)

        // await factory.createPair(tokenA.address, tokenB.address);

        const Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await Router.deploy(factory.address, wETH.address);
        await router.deployed();

        await tokenA.approve(router.address, amountA);
        await tokenB.approve(router.address, amountB);
    });
    // it("check",async()=>{
    //     await factory.createPair(tokenA.address,tokenB.address);
    //     const pairAddress = await factory.getPair(tokenA.address,tokenB.address);

    //     console.log("pair address",pairAddress);

    //     pair = await Pair.attach(pairAddress);

    //     const pairToken0 = await pair.token0();
    //     const pairToken1 = await pair.token1();

    //     expect(pairToken0).to.equal(tokenA.address);
    //     expect(pairToken1).to.equal(tokenB.address);

    //     const length = await factory.allPairsLength();
    //     expect(length).to.equal(1);
    
    //   })
    describe("addLiquidity testing",()=>{

    it("Testing", async () => {
        // Min amount must be 10000 tokens each
        // await factory.createPair(tokenA.address, tokenB.address);
        let balance,liquidity;
        await tokenA.approve(router.address, 10000);
        await tokenB.approve(router.address, 10000);

        balance =   await liquidityToken.balanceOf(signer1.address);
        expect(balance).to.equal(0);

        const routerr = await router.addLiquidity(tokenA.address,tokenB.address,10000,10000,0, 0,signer1.address,1659666362);
        
        pairAddress = await factory.getPair(tokenA.address,tokenB.address);
        pair = await pair.attach(pairAddress);
        getReserves = await pair.getReserves();

        reserve0 = await getReserves._reserve0;
        reserve1 = await getReserves._reserve1;

        // balanceA = await tokenA.balanceOf(pairAddress);
        // console.log(balanceA);
        // expect(routerr).to.equal(9000);

        // balance = await liquidityToken.balanceOf(signer1.address);
        // expect(balance).to.equal(9000);
        

        // token0 = await pair.token0();
        // token1 = await pair.token1();
        
        // expect(token0).to.be.equal(tokenA.address);
        // expect(token1).to.be.equal(tokenB.address);
        expect(reserve0).to.equal(10000);
        expect(reserve1).to.equal(10000);
        
    })   
    it("getting rejected because of less balance near the user",async ()=>{
       tokenA.connect(owner).transfer(signer1.address,10);
       tokenB.connect(owner).transfer(signer1.address,10);
       const rejected =  router.connect(signer1).addLiquidity(tokenA.address,tokenB.address,10000,10000,0, 0,signer1.address,1659666362);
     await expect(rejected).to.be.revertedWith("TransferHelper::transferFrom: transferFrom failed");

    })     
       
    it("addLiquidity getting rejected",async()=>{
        await factory.createPair(tokenA.address, tokenB.address);

        await tokenA.approve(router.address, 10000);
        await tokenB.approve(router.address, 10000);
         const check =  router.addLiquidity(
            tokenA.address,
            tokenB.address,
            10000,
            10000,
            9,
            9,
            owner.address,
            1659666362
        );
        expect(check).to.be.revertedWith("UniswapV2: PAIR_EXISTS");

    })
    it("check for rejection will less no of tokens approved",async ()=>{
        await tokenA.approve(router.address,100);
        await tokenB.approve(router.address,100);
        const revert  = router.addLiquidity(tokenA.address,tokenB.address,10000,10000,0,0,signer1.address, 1659666362);
        expect(revert).to.be.revertedWith("TransferHelper::transferFrom: transferFrom failed");
    })
    
 it("testing for addliquidity using eth",async ()=>{
    await tokenA.approve(router.address,10000)
        transferAmount = ethers.utils.parseEther('10');
        data = {value : transferAmount};

         await router.addLiquidityETH(tokenA.address,10,0,0,owner.address,1699666362,data);

         pairAddress = await factory.getPair(tokenA.address,wETH.address);
         _pair = await pair.attach(pairAddress);
         getReserves = await _pair.getReserves();
         reserve0 = await getReserves._reserve0;
         reserve1 = await getReserves._reserve1;
         //resvisit
         expect(reserve0).to.be.equal(10);
         expect(reserve1).to.equal(ethers.utils.parseUnits("1", 19));
 })
})
describe("removeLiquidity Testing",()=>{
    it("removing all liquidity",async()=>{
        await tokenA.connect(signer1).approve(router.address,10000);
        await tokenB.connect(signer1).approve(router.address,10000);

        const userTokenBalanceA = await tokenA.balanceOf(signer1.address);
        const userTokenBalanceB = await tokenB.balanceOf(signer1.address); 

        console.log(`user balance  after removing liquidity tokenA and tokenB balance  ${convert(userTokenBalanceA)}, ${convert(userTokenBalanceB)}`)



        await router.connect(signer1).addLiquidity(tokenA.address,tokenB.address,10000,10000,0,0,owner.address,1659666362);

        pairAddress = await factory.connect(signer1).getPair(tokenA.address,tokenB.address);

        _pair = await pair.attach(pairAddress);

        getReserves = await _pair.getReserves();

        reserve0_old = await getReserves._reserve0;
        reserve1_old = await getReserves._reserve1;

        const liquidity_old = await _pair.balanceOf(owner.address);
        const tokenABalance_old = await tokenA.balanceOf(_pair.address);
        const tokenBBalance_old = await tokenB.balanceOf(_pair.address);
        const userTokenBalanceA_old = await tokenA.balanceOf(signer1.address);
        const userTokenBalanceB_old = await tokenB.balanceOf(signer1.address); 
        console.log(`user balance after adding liquidity tokenA and tokenB balance  ${convert(userTokenBalanceA_old)}, ${convert(userTokenBalanceB_old)}`)

        console.log(`tokenA and tokenB balance in the pool before removing liquidity are ${convert(tokenABalance_old)},${convert(tokenBBalance_old)}`)

        console.log(`the new reserve0 and reserve1 of the pool are  ${convert(reserve0_old)} ,${convert(reserve1_old)} `);
        console.log(`${convert(liquidity_old)} are the liquidity tokens before removing liquidity`);
        expect(liquidity_old).to.equal(9000);

        await _pair.approve(router.address,10000);

        await router.removeLiquidity(tokenA.address,tokenB.address,convert(liquidity_old),9000,9000,signer1.address,1659666362);
        
        _pair1 = await pair.attach(pairAddress);
        getReserves_new  = await _pair1.getReserves();

        reserve0_new = await getReserves_new._reserve0;
        reserve1_new = await getReserves_new._reserve1;
        


        const liquidity_new = await _pair.balanceOf(owner.address);
        const tokenABalance_new = await tokenA.balanceOf(_pair1.address);
        const tokenBBalance_new = await tokenB.balanceOf(_pair1.address);
        const userTokenBalanceA_new = await tokenA.balanceOf(signer1.address);
        const userTokenBalanceB_new = await tokenB.balanceOf(signer1.address); 
        console.log(`the new reserve0 and reserve1 of the pool are  ${convert(reserve0_new)} ,${convert(reserve1_new)} `);

        console.log(`user balance  after removing liquidity tokenA and tokenB balance  ${convert(userTokenBalanceA_new)}, ${convert(userTokenBalanceB_new)}`)


     
        console.log(`----------------------------------------tokenA and tokenB balance in the pool after removing liquidity are ${convert(tokenABalance_new)},${convert(tokenBBalance_new)}`)
        
        console.log(`=> ${convert(liquidity_new)} are the liquidity tokens after removing liquidity`);

        expect(liquidity_new).to.equal(0);
        expect(userTokenBalanceA_new).to.equal(9000);
        expect(userTokenBalanceB_new).to.be.equal(9000);

        // expect(liquidity_new).to.be.lessThan(liquidity_old);

 })
 it("only removing some liquidity tokens",async ()=>{
    await tokenA.approve(router.address,10000);
    await tokenB.approve(router.address,10000);
    
    await router.addLiquidity(tokenA.address,tokenB.address,10000,10000,1,1,owner.address,1659666362);

    pairAddress = await factory.getPair(tokenA.address,tokenB.address);

    _pair = await pair.attach(pairAddress);
    getReserves = await _pair.getReserves();

    reserve0_old = await getReserves._reserve0;
    reserve1_old = await getReserves._reserve1;

    liquidityToken = await _pair.balanceOf(owner.address);

    console.log("old liquidity",convert(liquidityToken));

    await _pair.approve(router.address,10000);

    userBalanceTOkenA_old = await tokenA.balanceOf(signer1.address);
    userBalanceTOkenB_old = await tokenB.balanceOf(signer1.address);
    console.log(`the old reserve0 and reserve1 of the pool are  ${convert(reserve0_old)} ,${convert(reserve1_old)} `);

    console.log("balance of user befor removing liquidity",convert(userBalanceTOkenA_old),"----",convert(userBalanceTOkenB_old));
    await router.removeLiquidity(tokenA.address,tokenB.address,10,1,1,signer1.address,1659666362);

    _pair1 = await pair.attach(pairAddress);
    getReserves_new  = await _pair1.getReserves();

    reserve0_new = await getReserves_new._reserve0;
    reserve1_new = await getReserves_new._reserve1;

    liquidityToken_new = await _pair1.balanceOf(owner.address);
    userBalanceTOkenA_new = await tokenA.balanceOf(signer1.address);
    userBalanceTOkenB_new = await tokenB.balanceOf(signer1.address);
    console.log(`the new reserve0 and reserve1 of the pool are  ${convert(reserve0_new)} ,${convert(reserve1_new)} `);

    console.log("balance of user befor removing liquidity",convert(userBalanceTOkenA_new),"----",convert(userBalanceTOkenB_new));
  

    console.log("the new liquidity",convert(liquidityToken_new));
    expect(userBalanceTOkenA_old).to.lessThan(userBalanceTOkenA_new);
    // expect(userBalanceTOkenB_old).to.lessThan(userBalanceTOkenB_new);
    // expect(liquidityToken).to.lessThan(liquidityToken_new );


   
    
 })
 it("checking rejections ",async ()=>{
   
        await tokenA.approve(router.address,10000);
        await tokenB.approve(router.address,10000);
    
        await router.addLiquidity(tokenA.address,tokenB.address,10000,10000,0,0,owner.address,1659666362);
    
        pairAddress = await factory.getPair(tokenA.address,tokenB.address);
    
        _pair = await pair.attach(pairAddress);
    
        getReserves = await _pair.getReserves();
    
        reserve0_old = await getReserves._reserve0;
        reserve1_old = await getReserves._reserve1;
    
        const liquidity_old = await _pair.balanceOf(owner.address);
        await _pair.approve(router.address,10000);
    
        expect( router.removeLiquidity(tokenA.address,tokenB.address,convert(liquidity_old),9001,9000,owner.address,1659666362)).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_A_AMOUNT");
        expect( router.removeLiquidity(tokenA.address,tokenB.address,convert(liquidity_old),9000,9001,owner.address,1659666362)).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_B_AMOUNT");
   
 })
 it("remove liquidity with ETH",async ()=>{
    
 })
 

 })
})



