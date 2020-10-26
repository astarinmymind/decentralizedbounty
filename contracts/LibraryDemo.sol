
// If I were to implement a more complex bounty system, 
// where users could contribute to bounties in order to 
// increase the chances and speed it gets hunted and,
// I would use SafeMath to do the appropriate addition 
// and subtractions. 

// contract SafeMathBounties {

//   using SafeMath for uint256;

//   function contribute(
//     address payable _sender,
//     uint _bountyId,
//     uint _amount)
//     public
//     payable
//   {
//     require(_amount > 0); // Contributions of 0 tokens or token ID 0 should fail
    
//     bounties[_bountyId].balance = bounties[_bountyId].balance.add(_amount); // Increments the balance of the bounty

//     emit ContributionAdded(_bountyId,
//                            bounties[_bountyId].contributions.length - 1, // contributionId
//                            _sender,
//                            _amount);
//   }
// }