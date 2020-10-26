import React, { Component } from "react";
import BountiesContract from "./contracts/Bounties.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import { Text, Button, Box, Flex, Form, Input, Heading, Field, ToastMessage} from 'rimble-ui';

import BootstrapTable from 'react-bootstrap-table/lib/BootstrapTable';
import TableHeaderColumn from 'react-bootstrap-table/lib/TableHeaderColumn';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      account: null,
      bountiesInstance: undefined,
      bounties: [],
      bountyAmount: undefined,
      bountyData: undefined,
      bountyDeadline: undefined,
      storageValue: 0,
      bountyId: undefined,
      bountyId2: undefined,
      bountyId3: undefined,
      fulfillmentId: undefined,
      bountyAnswer: undefined
    }

    this.handleIssueBounty = this.handleIssueBounty.bind(this)
    this.handleFulfillBounty = this.handleFulfillBounty.bind(this)
    this.handleAcceptFulfillment = this.handleAcceptFulfillment.bind(this)
    this.handleCancelBounty = this.handleCancelBounty.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BountiesContract.networks[networkId];
      const instance = new web3.eth.Contract(
       BountiesContract.abi,
       deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ bountiesInstance: instance, web3: web3, account: accounts[0]})
      this.addEventListener(this)
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  addEventListener(component) {

    this.state.bountiesInstance.events.BountyIssued({fromBlock: 0, toBlock: 'latest'})
    .on('data', function(event){
      console.log(event);
      var newBountiesArray = component.state.bounties.slice()
      console.log('bounties issued: ' + event.returnValues)
      newBountiesArray.push(event.returnValues)
      component.setState({ bounties: newBountiesArray })
    })
    .on('error', console.error);

  }

  async handleIssueBounty(event) {
    console.log('reached handleIssueBounty' + event)
    if (typeof this.state.bountiesInstance !== 'undefined') {
      event.preventDefault();
      await this.state.bountiesInstance.methods.issueBounty(this.state.bountyData,this.state.bountyDeadline).send({from: this.state.account, value: this.state.web3.utils.toWei(this.state.bountyAmount, 'ether')})
    }
    window.toastProvider.addMessage("Bounty Issued", {
      variant: "success"
    })
  }

  async handleFulfillBounty(event)
  {
    console.log('reached handleFullFillBounty' + event)
    if (typeof this.state.bountiesInstance !== 'undefined') {
      event.preventDefault();
      await this.state.bountiesInstance.methods.fulfillBounty(this.state.bountyId,this.state.bountyAnswer).send({from: this.state.account})
    }
    window.toastProvider.addMessage("Bounty Fulfilled", {
      variant: "success"
    })
  }

  async handleAcceptFulfillment(event) {
    console.log('reached handleAcceptFulfillment' + event)
    if (typeof this.state.bountiesInstance !== 'undefined') {
      event.preventDefault();
      await this.state.bountiesInstance.methods.acceptFulfillment(this.state.bountyId2,this.state.fulfillmentId).send({from: this.state.account})
    }
    window.toastProvider.addMessage("Fulfillment Accepted", {
      variant: "success"
    })
  }

  async handleCancelBounty(event) {
    console.log('reached handleCancelBounty' + event)
    if (typeof this.state.bountiesInstance !== 'undefined') {
      event.preventDefault();
      await this.state.bountiesInstance.methods.cancelBounty(this.state.bountyId3).send({from: this.state.account})
    }
    window.toastProvider.addMessage("Bounty Cancelled", {
      variant: "success"
    })
  }

  // Handle form data change
  handleChange(event) {
    switch(event.target.name) {
        case "bountyData":
            this.setState({"bountyData": event.target.value})
            break;
        case "bountyDeadline":
            this.setState({"bountyDeadline": event.target.value})
            break;
        case "bountyAmount":
            this.setState({"bountyAmount": event.target.value})
            break;
        case "bountyId":
            this.setState({"bountyId": event.target.value})
            break;
        case "bountyAnswer":
            this.setState({"bountyAnswer": event.target.value})
            break;
        case "bountyId2":
            this.setState({"bountyId2": event.target.value})
            break;
        case "bountyId3":
            this.setState({"bountyId3": event.target.value})
            break;
        case "fulfillmentId":
            this.setState({"fulfillmentId": event.target.value})
            break;
        default:
            break;
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">

      <Box>
      <Heading as={"h1"}> TBD NAME </Heading>
      <Text> A Decentralized Bounty System </Text>
      </Box>

      <Flex>
      <Box p={3} width={1 / 2}>
      <Heading> Issue Bounty </Heading>
      <Form>
        <Box>
          <Field label="Question">
            <Input
            type="text"
            placeholder="enter bounty question"
            required="true"
            name="bountyData"
            value={this.state.bountyData}
            onChange={this.handleChange} />
          </Field>
          <Field label="Deadline">
            <Input
            type="text"
            placeholder="enter bounty deadline"
            required="true"
            name="bountyDeadline"
            value={this.state.bountyDeadline}
            onChange={this.handleChange} />
          </Field>
          <Field label="Amount">
            <Input
            type="text"
            placeholder="enter bounty amount"
            required="true"
            name="bountyAmount"
            value={this.state.bountyAmount}
            onChange={this.handleChange} />
          </Field>
        </Box>

      <Box>
      <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
      <Button value="Submit" onClick={this.handleIssueBounty} >Issue Bounty</Button>
      </Box>
      </Form>
      </Box>

      <Box p={3} width={1 / 2}>
      <Heading> Fulfill Bounty </Heading>
      <Form>
        <Box>
          <Field label="Bounty Id">
            <Input
              type="text"
              placeholder="enter bounty ID"
              required="true"
              name="bountyId"
              value={this.state.bountyId}
              onChange={this.handleChange} />
          </Field>
          <Field label="Bounty Answer">
            <Input
            type="text"
            placeholder="enter bounty answer"
            required="true"
            name="bountyAnswer"
            value={this.state.bountyAnswer}
            onChange={this.handleChange} />
            </Field>
        </Box>
      <Box>
      <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
      <Button value="Submit" onClick={this.handleFulfillBounty} >Fulfill Bounty</Button>
      </Box>
      </Form>
      </Box>
      </Flex>

      <Flex>
      <Box p={3} width={1 / 2}>
      <Heading> Accept Fulfillment </Heading>
      <Form>
        <Box>
          <Field label="Bounty Id">
              <Input
                type="text"
                placeholder="enter bounty ID"
                required="true"
                name="bountyId2"
                value={this.state.bountyId2}
                onChange={this.handleChange} />
            </Field>
          <Field label="Fulfillment Id">
            <Input
            type="text"
            placeholder="enter fulfillment Id"
            required="true"
            name="fulfillmentId"
            value={this.state.fufillmentId}
            onChange={this.handleChange} />
          </Field>
        </Box>

      <Box>
      <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
      <Button value="Submit" onClick={this.handleAcceptFulfillment} >Accept Fulfillment</Button>
      </Box>
      </Form>
      </Box>

      <Box p={3} width={1 / 2}>
      <Heading> Cancel Bounty </Heading>
      <Form>
        <Box>
          <Field label="Bounty Id">
            <Input
              type="text"
              placeholder="enter bounty ID"
              required="true"
              name="bountyId3"
              value={this.state.bountyId3}
              onChange={this.handleChange} />
          </Field>
        </Box>
      <Box>
      <ToastMessage.Provider ref={node => (window.toastProvider = node)} />
      <Button value="Submit" onClick={this.handleCancelBounty} >Cancel Bounty</Button>
      </Box>
      </Form>
      </Box>
      </Flex>

      <Flex>
      <Box width={1}>
      <Heading> Issued Bounties </Heading>
      <Form>
      <BootstrapTable data={this.state.bounties} striped hover>
        <TableHeaderColumn isKey dataField='bounty_id'>ID</TableHeaderColumn>
        <TableHeaderColumn dataField='issuer'>Issuer</TableHeaderColumn>
        <TableHeaderColumn dataField='amount'>Amount</TableHeaderColumn>
        <TableHeaderColumn dataField='data'>Bounty Data</TableHeaderColumn>
      </BootstrapTable>
      </Form>
      </Box>
      </Flex>
      
      </div> 
    );
  }
}

export default App;

