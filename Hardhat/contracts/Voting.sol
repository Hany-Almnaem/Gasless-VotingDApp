// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract Voting is ERC2771Context{

    struct Proposal {
        uint id;
        string title;
        string description;
        uint createdAt;
        uint votesFor;
        uint votesAgainst;
        bool closed;
    }

    uint public proposalCount;
    mapping(uint => Proposal) public proposals;
    mapping(address => mapping(uint => bool)) public votes;

    event ProposalCreated(uint proposalId, string title, string description, uint createdAt);
    event VoteCasted(uint proposalId, address voter, bool support);
    event ProposalClosed(uint proposalId);

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function createProposal(string calldata title, string calldata description) external {
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: title,
            description: description,
            createdAt: block.timestamp,
            votesFor: 0,
            votesAgainst: 0,
            closed: false
        });
        
        emit ProposalCreated(proposalCount, title, description, block.timestamp);
        proposalCount++;
    }

    function voteOnProposal(uint proposalId, bool support) external {
        require(!proposals[proposalId].closed, "Proposal is closed");
        require(!votes[_msgSender()][proposalId], "Already voted");

        votes[_msgSender()][proposalId] = true;
        if (support) {
            proposals[proposalId].votesFor++;
        } else {
            proposals[proposalId].votesAgainst++;
        }

        emit VoteCasted(proposalId, _msgSender(), support);
    }

    function checkAndCloseProposal(uint proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.closed, "Proposal is already closed");
        require(block.timestamp > proposal.createdAt + 5 minutes, "Voting period still active");// for testing, it can modify later 
        require(proposal.votesFor == 0 && proposal.votesAgainst == 0, "Proposal has votes");

        proposal.closed = true;
        emit ProposalClosed(proposalId);
    }
    
}
