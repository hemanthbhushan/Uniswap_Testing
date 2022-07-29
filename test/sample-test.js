
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { BigNumber } = require("ethers");


  function convert(number) {
    return ethers.BigNumber.from(number).toNumber();
    
  }
  function expandTo18Decimals(n) {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(18));
  }

describe("Testing", () => {
    let owner, factory, router, tokenA, tokenB, wETH,Pair,pair,liquidityToken;

    beforeEach(async () => {
        [owner,signer1,signer2] = await ethers.getSigners();
        amountA = 10000;
        amountB = 10000;

        const TokenA = await ethers.getContractFactory("TokenA");
        const TokenB = await ethers.getContractFactory("TokenB");
        const TokenC = await ethers.getContractFactory("TokenC");
        const TokenD = await ethers.getContractFactory("TokenD");
        const WETH = await ethers.getContractFactory("WETH");
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        const TaxableToken = await ethers.getContractFactory("DeflatingERC20");
        Pair = await ethers.getContractFactory("UniswapV2Pair");
        const LiquidityToken = await ethers.getContractFactory("UniswapV2ERC20");

        factory = await Factory.deploy(owner.address);
        await factory.deployed();
        tokenA = await TokenA.deploy();
        await tokenA.deployed();
        tokenB = await TokenB.deploy();
        await tokenB.deployed();

        tokenC = await TokenC.deploy();
        await tokenC.deployed();
        tokenD = await TokenD.deploy();
        await tokenD.deployed();
        wETH = await WETH.deploy();
        await wETH.deployed();

        taxableToken = await TaxableToken.deploy(1000000000000000);
        await taxableToken.deployed();

        pair = await Pair.deploy();
        await pair.deployed();
        liquidityToken = await LiquidityToken.deploy();
        liquidityToken.deployed();

        await tokenA.mintToken(signer1.address,10000);
        await tokenB.mintToken(signer1.address,10000);

       

        const Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await Router.deploy(factory.address, wETH.address);
        await router.deployed();

        await tokenA.approve(router.address, amountA);
        await tokenB.approve(router.address, amountB);
    });
    it("check",async()=>{
        await factory.createPair(tokenA.address,tokenB.address);
        const pairAddress = await factory.getPair(tokenA.address,tokenB.address);

        console.log("pair address",pairAddress);

        _pair = await pair.attach(pairAddress);

        const pairToken0 = await _pair.token0();
        const pairToken1 = await _pair.token1();

        expect(pairToken0).to.equal(tokenB.address);
        expect(pairToken1).to.equal(tokenA.address);

        const length = await factory.allPairsLength();
        expect(length).to.equal(1);
    
      })
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
    await tokenA.approve(router.address,10000);
        transferAmount = ethers.utils.parseEther('10');
        data = {value : transferAmount};

    
    await router.addLiquidityETH(tokenA.address,10,0,0,owner.address,1699666362,data);
         pairAddress = await factory.getPair(tokenA.address,wETH.address);
        _pair = await pair.attach(pairAddress);
        liquidity_new = await _pair.balanceOf(owner.address);
        console.log("liquidity_",Number(liquidity_new));
        
         getReserves = await _pair.getReserves();
         reserve0 = await getReserves._reserve0;
         reserve1 = await getReserves._reserve1;
         console.log("reserve 0",Number(reserve0));
         console.log("reserve 1",Number(reserve1));


         //resvisit 
         expect(reserve0).to.be.equal(ethers.utils.parseUnits("1", 19));
         expect(reserve1).to.equal(10);
 })
})
//remove LIquidity starts here
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
        console.log(`the new reserve0 and reserve1 of the pool are  ${Number(reserve0_new)} ,${convert(reserve1_new)} `);

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
    // expect(userBalanceTOkenA_old).to.lessThan(Number(userBalanceTOkenA_new));
    // expect(userBalanceTOkenB_old).to.lessThan(userBalanceTOkenB_new);
    expect(liquidityToken).to.lessThan(liquidityToken_new );


   
    
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

    await tokenA.approve(router.address,100000);
    await wETH.approve(router.address,10000000);
    transferAmount = ethers.utils.parseEther('10');
    data = {value : transferAmount};
    

    await router.addLiquidityETH(tokenA.address,100000,0,0,owner.address,1659666362,data);

    pairAddress = await await factory.getPair(tokenA.address,wETH.address);

    _pair = await pair.attach(pairAddress);

    getReserves = await _pair.getReserves();

    reserve0 = await getReserves._reserve0;
    reserve1 = await getReserves._reserve1;
    console.log("reserve0_old and reserve1_old",Number(reserve0),Number(reserve1));


    liquidity_old = await _pair.balanceOf(owner.address);
    console.log("old liquidity tokens ",Number(liquidity_old));
    await _pair.approve(router.address,100000000000000)
  
    await router.removeLiquidityETH(tokenA.address,liquidity_old,1,1,signer1.address,1659666362);
    getReserves_new = await _pair.getReserves();
    reserve0_new = await getReserves_new._reserve0;
    reserve1_new = await getReserves_new._reserve1;
    console.log("reserve0_new and reserve1_new",Number(reserve0_new),Number(reserve1_new));


    liquidity_new = await _pair.balanceOf(owner.address);
    console.log("new liquidity tokens ",Number(liquidity_new));
    // balanceOfUserA = await tokenA.balanceOf(signer1.address);
    // balanceOfUserB = await ethers.provider.getBalance(signer1.address);

    // console.log(`--=========balanceOfUserA${Number(balanceOfUserA)}, balanceOfUserB is ${Number(balanceOfUserB)}`);

 })

 })
 describe("Testing on Swap",()=>{
  it("swapExactTokensForTokens",async ()=>{
    await tokenA.approve(router.address,20000);
    await tokenB.approve(router.address,20000);
   
    
    await router.addLiquidity(tokenA.address,tokenB.address,12000,10000,1,1,owner.address,1659666362);
    
    pairAddress = await factory.getPair(tokenA.address,tokenB.address);
    
    _pair = await pair.attach(pairAddress);

    getReserves = await _pair.getReserves();

    reserve0_old = await getReserves._reserve0;
    reserve1_old = await getReserves._reserve1;
    
    console.log(`the old reserve0 and reserve1 of the pool are  ${convert(reserve0_old)} ,${convert(reserve1_old)} `);
  //tokens order gts sorted depending of there address
    router.swapExactTokensForTokens(1000,0,[tokenA.address,tokenB.address],signer2.address,1659666362);
    getReserves = await _pair.getReserves();

    reserve0_A = await getReserves._reserve0;
    reserve1_B = await getReserves._reserve1;

    balanceOfUserA = await tokenA.balanceOf(signer2.address);
    balanceOfUserB = await tokenB.balanceOf(signer2.address);

    console.log("token balance of A ",Number(balanceOfUserA),"token balance of B ",Number(balanceOfUserB));
    console.log(`the new reserveA and reserveB of the pool are  ${convert(reserve0_A)} ,${convert(reserve1_B)} `);
    router.swapExactTokensForTokens(1000,0,[tokenB.address,tokenA.address],signer2.address,1659666362);
    getReserves = await _pair.getReserves();
    reserve0_A = await getReserves._reserve0;
    reserve1_B = await getReserves._reserve1;
    console.log(`the new reserveA and reserveB of the pool are  ${convert(reserve0_A)} ,${convert(reserve1_B)} `);
    
  })
  it("test for swapTokensForExactTokens",async ()=>{

    await tokenA.approve(router.address,20000);
    await tokenB.approve(router.address,20000);
   
    
    await router.addLiquidity(tokenA.address,tokenB.address,10000,12000,1,1,owner.address,1659666362);
    
    pairAddress = await factory.getPair(tokenA.address,tokenB.address);
    
    _pair = await pair.attach(pairAddress);

    getReserves = await _pair.getReserves();

    reserve0_old = await getReserves._reserve0;
    reserve1_old = await getReserves._reserve1;
    
    console.log(`the old reserve0 and reserve1 of the pool are  ${convert(reserve0_old)} ,${convert(reserve1_old)} `);
  //tokens order gts sorted depending of there address
    router.swapTokensForExactTokens(5,10,[tokenB.address,tokenA.address],signer2.address,1659666362);
    getReserves = await _pair.getReserves();

    reserve0_A = await getReserves._reserve0;
    reserve1_B = await getReserves._reserve1;

    balanceOfUserA = await tokenA.balanceOf(signer2.address);
    balanceOfUserB = await tokenB.balanceOf(signer2.address);

    console.log("token balance of A ",Number(balanceOfUserA),"token balance of B ",Number(balanceOfUserB));
    console.log(`the new reserveA and reserveB of the pool are  ${convert(reserve0_A)} ,${convert(reserve1_B)} `);
   
  })
  it("swapping Exact ETH for tokens",async()=>{
    await tokenA.approve(router.address,10000);
    transferAmount = ethers.utils.parseEther("100");
    data = {value : transferAmount};
    
    await router.addLiquidityETH(tokenA.address,10000,1,1,owner.address,1659666362,data);
    pairAddress = await factory.getPair(tokenA.address,wETH.address);

    _pair = await pair.attach(pairAddress);
    getReserves = await _pair.getReserves();
    reserve0_ethold  = await  getReserves._reserve0;
    reserve1_ethold = await getReserves._reserve1;
    console.log("reserv0,reserve1",Number(reserve0_ethold),Number(reserve1_ethold));

    transferAmount = ethers.utils.parseEther("10");
    data = {value : transferAmount};

    router.swapExactETHForTokens(1,[wETH.address,tokenA.address],signer1.address,1659666362,data);

    _pair = await pair.attach(pairAddress);
    getReserves = await _pair.getReserves();
    reserve0_eth  = await  getReserves._reserve0;
    reserve1_eth = await getReserves._reserve1;
    console.log("reserv0,reserve1",Number(reserve0_eth),Number(reserve1_eth));
})
it("swap Tokens For Exact ETH ",async ()=>{
  await tokenA.approve(router.address,100000);
  transferAmount = ethers.utils.parseEther("0.0001");
  data = {value : transferAmount};

  await router.addLiquidityETH(tokenA.address,15,0,0,owner.address,1659666362,data);
  pairAddress = await factory.getPair(tokenA.address,wETH.address);
  _pair = await pair.attach(pairAddress);
  getReserves = await _pair.getReserves();
  reserve0 = await getReserves._reserve0;
  reserve1 = await getReserves._reserve1;
  console.log("reserv0,reserve1",Number(reserve0),Number(reserve1));

  router.swapTokensForExactETH(10000000,10,[tokenA.address,wETH.address],signer1.address,1659666362);
  _pair = await pair.attach(pairAddress);
  getReserves = await _pair.getReserves();
  reserve0_new = await getReserves._reserve0;
  reserve1_new = await getReserves._reserve1;
  console.log("reserv0_new ,reserve1_new",Number(reserve0_new),Number(reserve1_new));
})
it("swap Exact Tokens For ETH",async ()=>{
  await tokenA.approve(router.address,100000);
  transferAmount = ethers.utils.parseEther("1");
  data = {value : transferAmount};

  await router.addLiquidityETH(tokenA.address,15,0,0,owner.address,1659666362,data);
  pairAddress = await factory.getPair(tokenA.address,wETH.address);
  _pair = await pair.attach(pairAddress);
  getReserves = await _pair.getReserves();
  reserve0 = await getReserves._reserve0;
  reserve1 = await getReserves._reserve1;
  console.log("reserv0,reserve1",Number(reserve0),Number(reserve1));

  router.swapExactTokensForETH(2,100000000,[tokenA.address,wETH.address],signer1.address,1659666362)
  _pair = await pair.attach(pairAddress);
  getReserves = await _pair.getReserves();
  reserve0_new = await getReserves._reserve0;
  reserve1_new = await getReserves._reserve1;
  console.log("reserv0,reserve1",Number(reserve0_new),Number(reserve1_new));


})
it("swap ETH for exact Tokens",async ()=>{
  await tokenA.approve(router.address,100000);
  transferAmount = ethers.utils.parseEther("1");
  data = {value : transferAmount};

  await router.addLiquidityETH(tokenA.address,15,0,0,owner.address,1659666362,data);
  pairAddress = await factory.getPair(tokenA.address,wETH.address);
  _pair = await pair.attach(pairAddress);
  getReserves = await _pair.getReserves();
  reserve0 = await getReserves._reserve0;
  reserve1 = await getReserves._reserve1;
  console.log("reserv0,reserve1",Number(reserve0),Number(reserve1));

  transferAmount = ethers.utils.parseEther("0.9");
  data = {value : transferAmount};

  router.swapETHForExactTokens(1,[wETH.address,tokenA.address],signer1.address,1659666362,data)
  _pair = await pair.attach(pairAddress);
  getReserves = await _pair.getReserves();
  reserve0_new = await getReserves._reserve0;
  reserve1_new = await getReserves._reserve1;
  console.log("reserv0,reserve1",Number(reserve0_new),Number(reserve1_new));


})
})
describe("swapping tokens extended",()=>{
  it("swap Exact Tokens For Tokens Supporting Fee On Transfer Tokens",async()=>{
    await tokenA.approve(router.address,1000000);
    await taxableToken.approve(router.address,1010000);
   
    
    await router.addLiquidity(tokenA.address,taxableToken.address,10000,1000000,1,1,owner.address,1659666362);
    
    pairAddress = await factory.getPair(tokenA.address,taxableToken.address);
    
     _pair = await pair.attach(pairAddress);

    getReserves = await _pair.getReserves();

    reserve0_old = await getReserves._reserve0;
    reserve1_old = await getReserves._reserve1;
    
    console.log(`the old reserve0 and reserve1 of the pool are  ${Number(reserve0_old)} ,${Number(reserve1_old)} `);
    // expect()
   
   router.swapExactTokensForTokensSupportingFeeOnTransferTokens(10000,0,[tokenA.address,taxableToken.address],signer1.address,1659666362);
    _pair1 = await pair.attach(pairAddress);

    getReserves = await _pair1.getReserves();
     balanceOf = await taxableToken.balanceOf(signer1.address);
     console.log("user taxable token balance",Number(balanceOf));

    reserve0_new = await getReserves._reserve0;
    reserve1_new = await getReserves._reserve1;
    
    console.log(`the new reserve0 and reserve1 of the pool are  ${convert(reserve0_new)} ,${convert(reserve1_new)} `);
  })
  it("swap Exact ETH For Tokens Supporting Fee On Transfer Tokens",async ()=>{
    await taxableToken.approve(router.address,100000000);
        transferAmount = ethers.utils.parseEther('0.00000000000001');
        data = {value : transferAmount};

    
    await router.addLiquidityETH(taxableToken.address,1000000,0,0,owner.address,1699666362,data);
         pairAddress = await factory.getPair(taxableToken.address,wETH.address);
       const _pair = await pair.attach(pairAddress);
        
         getReserves = await _pair.getReserves();
         reserve0 = await getReserves._reserve0;
         reserve1 = await getReserves._reserve1;
         console.log("reserve 0",Number(reserve0));
         console.log("reserve 1",Number(reserve1));
         transferAmount = ethers.utils.parseEther('0.0000000000000001');
        data = {value : transferAmount};
        router.swapExactETHForTokensSupportingFeeOnTransferTokens(1,[wETH.address,taxableToken],signer1.address,1699666362,data);
        _pair1 = await pair.attach(pairAddress);
         getReserves = await _pair1.getReserves();
         reserve0_eth  = await  getReserves._reserve0;
         reserve1_eth = await getReserves._reserve1;
         console.log("reserv0_new ,reserve1_new",Number(reserve0_eth),Number(reserve1_eth));
 })
 it("swap Exact Tokens For ETH Supporting Fee On Transfer Tokens",async()=>{
  await taxableToken.approve(router.address,1000000);
  transferAmount = ethers.utils.parseEther('0.00000000000001');
  data = {value : transferAmount};
  await router.addLiquidityETH(taxableToken.address,1000000,0,0,owner.address,1699666362,data);
  pairAddress = await factory.getPair(taxableToken.address,wETH.address);
  const _pair = await pair.attach(pairAddress);
 
  getReserves = await _pair.getReserves();
  reserve0 = await getReserves._reserve0;
  reserve1 = await getReserves._reserve1;
  console.log("reserve 0",Number(reserve0));
  console.log("reserve 1",Number(reserve1));
  
  router.swapExactTokensForETHSupportingFeeOnTransferTokens(10000,1,[taxableToken.address,wETH.address],signer1.address,1699666362);
  _pair1 = await pair.attach(pairAddress);

    getReserves = await _pair1.getReserves();
     balanceOf = await taxableToken.balanceOf(signer1.address);
     console.log("user taxable token balance",Number(balanceOf));

    reserve0_new = await getReserves._reserve0;
    reserve1_new = await getReserves._reserve1;
    
    console.log(`the new reserve0 and reserve1 of the pool are  ${Number(reserve0_new)} ,${Number(reserve1_new)} `);
 })

})


})
