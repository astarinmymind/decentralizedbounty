# Measures taken to avoid common attacks

There are [common attacks](https://consensys.github.io/smart-contract-best-practices/known_attacks/) which need closer attention when building smart contracts. A series of measures was taken into account to avoid these common attacks. 

### Reentrancy

This attack is mitigated by performing internal work first and then calling external contracts.

### Cross-function

This attack is mitigated by performing internal work first and then calling external contracts.

## Integer Overflow and Underflow

This project uses `SafeMath` from **OpenZeppelin library** which has math operations with safety checks that throw on error.

## Logic Bugs

Simple programming mistakes can cause the contract to behave differently to its stated rules, especially on 'edge cases'.

In this project this attack is mitigated by:

- Running tests against the contracts
- Following Solidity coding standards and general coding best practices for safety-critical software

