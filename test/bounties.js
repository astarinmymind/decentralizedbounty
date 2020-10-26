const Bounties = artifacts.require("./Bounties.sol");
const getCurrentTime = require('./utils/time').getCurrentTime;
const increaseTimeInSeconds = require('./utils/time').increaseTimeInSeconds;
const assertRevert = require('./utils/assertRevert').assertRevert;
const dayInSeconds = 86400;


contract('Bounties', function(accounts) {

  let bountiesInstance;

  beforeEach(async () => {
      bountiesInstance = await Bounties.new()
  })

  // tests for function issueBounty: 
  // checks if user can successfully issue a bounty
  // checks return value
  // makes sure users cannot issue bounties with 0 eth or enter a deadline that is in the past

  it("Should allow a user to issue a new bounty", async () => {
    let time = await getCurrentTime()
    let tx = await bountiesInstance.issueBounty("data",
                                time + (dayInSeconds * 2),
                                {from: accounts[0], value: 500000000000});

    assert.strictEqual(tx.receipt.logs.length, 1, "issueBounty() call did not log 1 event");
    assert.strictEqual(tx.logs.length, 1, "issueBounty() call did not log 1 event");
    const logBountyIssued = tx.logs[0];
    assert.strictEqual(logBountyIssued.event, "BountyIssued", "issueBounty() call did not log event BountyIssued");
    assert.strictEqual(logBountyIssued.args.bounty_id.toNumber(),0, "BountyIssued event logged did not have expected bounty_Id");
    assert.strictEqual(logBountyIssued.args.issuer, accounts[0], "BountyIssued event logged did not have expected issuer");
    assert.strictEqual(logBountyIssued.args.amount.toNumber(),500000000000, "BountyIssued event logged did not have expected amount");

  });

  it("Should return an integer when calling issueBounty", async () => {
    let time = await getCurrentTime()
    let result = await bountiesInstance.issueBounty.call("data",
                                time + (dayInSeconds * 2),
                                {from: accounts[0], value: 500000000000});

    assert.strictEqual(result.toNumber(), 0, "issueBounty() call did not return correct id");
  });

  it("Should not allow a user to issue a bounty without sending ETH", async () => {
    let time = await getCurrentTime()
    assertRevert(bountiesInstance.issueBounty("data",
                                time + (dayInSeconds * 2),
                                {from: accounts[0]}), "Bounty issued without sending ETH");

  });

  it("Should not allow a user to issue a bounty when sending value of 0", async () => {
    let time = await getCurrentTime()
    assertRevert(bountiesInstance.issueBounty("data",
                                time + (dayInSeconds * 2),
                                {from: accounts[0], value: 0}), "Bounty issued when sending value of 0");

  });

  it("Should not allow a user to issue a bounty with a deadline in the past", async () => {
    let time = await getCurrentTime()
    assertRevert(bountiesInstance.issueBounty("data",
                                time - 1,
                                {from: accounts[0], value: 0}), "Bounty issued with deadline in the past");

  });

  it("Should not allow a user to issue a bounty with a deadline of now", async () => {
    let time = await getCurrentTime()
    assertRevert(bountiesInstance.issueBounty("data",
                                time,
                                {from: accounts[0], value: 0}), "Bounty issued with deadline of now");

  });

  // tests for function fulfillBounty:
  // checks if user can successfully fulfill a bounty
  // cannot fulfill bounty that does not exist
  // issuer can not fulfill their own bounty
  // cannot fulfill a bounty that has already expired

  it("Should allow a user to fulfill an existing bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    let tx = await bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]});

    assert.strictEqual(tx.receipt.logs.length, 1, "fulfillBounty() call did not log 1 event");
    assert.strictEqual(tx.logs.length, 1, "fulfillBounty() call did not log 1 event");
    const logBountyFulfilled = tx.logs[0];
    assert.strictEqual(logBountyFulfilled.event, "BountyFulfilled", "fulfillBounty() call did not log event BountyFulfilled");
    assert.strictEqual(logBountyFulfilled.args.bounty_id.toNumber(),0, "BountyFulfilled event logged did not have expected bounty_Id");
    assert.strictEqual(logBountyFulfilled.args.fulfiller, accounts[1], "BountyFulfilled event logged did not have expected fulfiller");
    assert.strictEqual(logBountyFulfilled.args.fulfillment_id.toNumber(),0, "BountyFulfilled event logged did not have expected fulfillment_id");

  });

  it("Should not allow a user to fulfill a non existent bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000000000});

    assertRevert(bountiesInstance.fulfillBounty(1,"data",{from: accounts[1]}), "Fulfillment accepted with invalid bounty_id");

  });

  it("Should not allow an issuer to fulfill an existing bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000000000});

    assertRevert(bountiesInstance.fulfillBounty(0,"data",{from: accounts[0]}), "Fulfillment accepted from issuer");

  });

  it("Should not allow a user to fulfill an existing bounty where the deadline has passed", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000000000});

    await increaseTimeInSeconds((dayInSeconds * 2)+1)

    assertRevert(bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]}), "Fulfillment accepted when deadline has passed");

  });

  // tests for function acceptFulfillment: 
  // checks if issuer can successfully accept an existing fulfillment
  // issuer cannot accept a nonexistent fulfillment
  // non-issuer cannot accept fulfillment
  // users cannot fulfill accepted bounty

  it("Should allow the issuer to accept an existing fulfillment", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    await bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]});

    let tx = await bountiesInstance.acceptFulfillment(0,0,{from: accounts[0]})

    assert.strictEqual(tx.receipt.logs.length, 1, "acceptFulfillment() call did not log 1 event");
    assert.strictEqual(tx.logs.length, 1, "acceptFulfillment() call did not log 1 event");
    const logFulfillmentAccepted = tx.logs[0];
    assert.strictEqual(logFulfillmentAccepted.event, "FulfillmentAccepted", "acceptFulfillment() call did not log event FulfillmentAccepted");
    assert.strictEqual(logFulfillmentAccepted.args.bounty_id.toNumber(),0, "FulfillmentAccepted event logged did not have expected bounty_Id");
    assert.strictEqual(logFulfillmentAccepted.args.issuer, accounts[0], "FulfillmentAccepted event logged did not have expected issuer");
    assert.strictEqual(logFulfillmentAccepted.args.fulfiller, accounts[1], "FulfillmentAccepted event logged did not have expected fulfiller");
    assert.strictEqual(logFulfillmentAccepted.args.fulfillment_id.toNumber(),0, "FulfillmentAccepted event logged did not have expected fulfillment_id");
    assert.strictEqual(logFulfillmentAccepted.args.amount.toNumber(),500000000000, "FulfillmentAccepted event logged did not have expected amount");


  });

  it("Should not allow issuer to accept a non existent fulfillment", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    await bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]});

    assertRevert(bountiesInstance.acceptFulfillment(0,1,{from: accounts[0]}), "Fulfillment accepted with invalid fufillment_id");

  });

  it("Should not allow a user who is not the issuer to accept an existing fulfillment", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    await bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]});

    assertRevert(bountiesInstance.acceptFulfillment(0,0,{from: accounts[1]}),"Fulfillment accepted by user other than issuer")

  });

  it("Should not allow a user to fulfill an ACCEPTED bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    await bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]});

    await bountiesInstance.acceptFulfillment(0,0,{from: accounts[0]})

    assertRevert(bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]}), "Fulfillment accepted for bounty already accepted");

  });

  // tests for function cancelBounty:
  // checks if issuer can successfully cancel an existing bounty
  // issuer cannot cancel a nonexistent bounty
  // issuer cannot cancel an existing bounty which has already been accepted
  // non-issuers cannot cancel a bounty

  it("Should allow the issuer to cancel an existing bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    let tx = await bountiesInstance.cancelBounty(0,{from: accounts[0]})

    assert.strictEqual(tx.receipt.logs.length, 1, "cancelBounty() call did not log 1 event");
    assert.strictEqual(tx.logs.length, 1, "cancelBounty() call did not log 1 event");
    const logBountyCancelled = tx.logs[0];
    assert.strictEqual(logBountyCancelled.event, "BountyCancelled", "cancelBounty() call did not log event FulfillmentAccepted");
    assert.strictEqual(logBountyCancelled.args.bounty_id.toNumber(),0, "BountyCancelled event logged did not have expected bounty_Id");
    assert.strictEqual(logBountyCancelled.args.issuer, accounts[0], "FulfillmentAccepted event logged did not have expected issuer");
    assert.strictEqual(logBountyCancelled.args.amount.toNumber(),500000000000, "FulfillmentAccepted event logged did not have expected amount");

  });

  it("Should not allow the issuer to cancel a non existent bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    assertRevert(bountiesInstance.cancelBounty(1,{from: accounts[0]}), "Cancelled non existent bounty")


  });

  it("Should not allow the issuer to cancel an existing bounty which has already been accepted", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    await bountiesInstance.fulfillBounty(0,"data",{from: accounts[1]});

    await bountiesInstance.acceptFulfillment(0,0,{from: accounts[0]})

    assertRevert(bountiesInstance.cancelBounty(0,{from: accounts[0]}), "Cancelled bounty which had already been accepted")

  });

  it("Should not allow a user which is not the issuer to cancel an existing bounty", async () => {

    let time = await getCurrentTime()
    await bountiesInstance.issueBounty("data",
                          time + (dayInSeconds * 2),
                          {from: accounts[0], value: 500000000000});

    assertRevert(bountiesInstance.cancelBounty(0,{from: accounts[1]}), "Cancelled by an address which is not the issuer")

  });

});
