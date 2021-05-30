/*global ENV */
import React from "react";
import './style.less';

const CONTRACT_ADDRESS = ENV.CONTRACT_ADDRESS;
const cryptoZombiesABI = require('../../build/contracts/ZombieOwnership.json').abi;
const Web3 = require('web3');


let web3js;
let cryptoZombiesContract;

const metamaskMessage = () => <div>Handle the case where the user doesn't have Metamask installed.<br />Probably show them a message prompting them to install Metamask.</div>
const label = (text) => <div className="label">{text}</div>

const showZombie = (zombie) => <div key={zombie.dna} className="zombie">
    <div>Name: {zombie.name}</div>
    <div>DNA: {zombie.dna}</div>
    <div>Level: {zombie.level}</div>
    <div>Wins: {zombie.winCount}</div>
    <div>Losses: {zombie.lossCount}</div>
    <div>Ready Time: {zombie.readyTime}</div>
</div >


export class App extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            account: undefined,
            zombies: [],
            createZombieName: ""
        };
        web3js = props.metamaskInstalled ? new Web3(web3.currentProvider) : undefined;
        cryptoZombiesContract = web3js ? new web3js.eth.Contract(cryptoZombiesABI, CONTRACT_ADDRESS) : undefined;
        this.initAccount();
        this.eventListen();
    }

    setAccount(account) {
        this.setState(Object.assign({}, this.state, { account: account }));
    }

    setZombies(zombies) {
        this.setState(Object.assign({}, this.state, { zombies: zombies }));
    }
    setCreateZombieName(name) {
        this.setState(Object.assign({}, this.state, { createZombieName: name }));
    }

    initAccount() {
        ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
            this.setAccount(accounts[0]);
            this.syncZombies();
        });
    }

    eventListen() {
        const { account } = this.state;
        if (account) {
            cryptoZombiesContract.events.Transfer({ filter: { _to: account } })
                .on("data", function (event) {
                    let data = event.returnValues;
                    // this.syncZombies();
                }).on("error", console.error);
        }
    }

    createRandomZombie(name) {
        const { account } = this.state;
        cryptoZombiesContract.methods.createRandomZombie(name)
            .send({ from: account })
            .on("receipt", (_) => this.syncZombies())
            .on("error", (error) => console.error(error));
    }

    levelUp() {
        const { account } = this.state;
        cryptoZombiesContract.methods.levelUp(0)
            .send({ from: account, value: web3js.utils.toWei("0.001", "ether") })
            .on("receipt", (_) => this.syncZombies())
            .on("error", (error) => console.error(error));
    }

    syncZombies() {
        const { account } = this.state;
        if (account) {
            cryptoZombiesContract.methods.getZombiesByOwner(account).call().then(ids => {
                if (ids) {
                    Promise.all(ids.map(id => cryptoZombiesContract.methods.zombies(id).call())).then(zombies => {
                        this.setZombies(zombies);
                    });
                } else {
                    this.setZombies([]);
                }
            });
        }
    }

    showCreateZombie() {
        const { createZombieName } = this.state;
        return <div><input type="text" id="createZombie" value={createZombieName} onChange={(e) => this.setCreateZombieName(e.target.value)} />
            <button onClick={() => {
                const { createZombieName } = this.state;
                if (createZombieName.trim().length > 0) {
                    this.createRandomZombie(createZombieName.trim());
                    this.setCreateZombieName("");
                }
            }} >createZombie</button>
        </div >;
    }

    showLevelUp() {
        return <div><button onClick={() => {
            this.levelUp()
        }}>levelUp</button></div>
    }

    render() {
        const { metamaskInstalled } = this.props;
        const { account, zombies } = this.state;
        const show = () => <div>
            {label("account: " + account)}
            {this.showCreateZombie()}
            {this.showLevelUp()}
            <div className="zombies">
                zombies<br />
                {zombies.map(showZombie)}
            </div>
        </div>

        return (
            metamaskInstalled ? show() : metamaskMessage()
        );
    }
}