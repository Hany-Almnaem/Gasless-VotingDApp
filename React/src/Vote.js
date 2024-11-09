import './styles.css';
import React, { useState, useEffect, useCallback } from 'react';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { BrowserProvider, Contract } from 'ethers';
import contractAbi from './contractAbi.json';

const Vote = ({ contractAddress }) => {
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [support, setSupport] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [proposals, setProposals] = useState([]);
  const gelatoApiKey = process.env.REACT_APP_GELATO_API_KEY;

  // Create a new proposal
  const createProposal = async () => {
    try {
      setIsSubmitting(true);
      setFeedbackMessage('Creating proposal...');

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi.abi, signer);

      const data = contract.interface.encodeFunctionData('createProposal', [proposalTitle, proposalDescription]);
      const relay = new GelatoRelay();
      
      // Use Gelato relay to submit the proposal
      const request = {
        chainId: (await provider.getNetwork()).chainId,
        target: contractAddress,
        data: data,
        user: await signer.getAddress(),
      };

      // Track the transaction
      const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoApiKey);
      
      setFeedbackMessage('Waiting for transaction confirmation...');
      
      const checkTransaction = async () => {
        try {
          const status = await relay.getTaskStatus(relayResponse.taskId);
          if (status.taskState === 'ExecSuccess') {
            setFeedbackMessage('Proposal created successfully!');
            setProposalTitle('');
            setProposalDescription('');
            setTimeout(() => {
              fetchAllProposals();
            }, 2000);
            return true;
          } else if (status.taskState === 'ExecReverted' || status.taskState === 'Cancelled') {
            setFeedbackMessage('Transaction failed. Please try again.');
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error checking transaction:', error);
          return false;
        }
      };

      const pollInterval = setInterval(async () => {
        const finished = await checkTransaction();
        if (finished) {
          clearInterval(pollInterval);
          setIsSubmitting(false);
        }
      }, 2000);

    } catch (error) {
      setFeedbackMessage('Error creating proposal: ' + error.message);
      console.error(error);
      setIsSubmitting(false);
    }
  };

  // Vote on a proposal
  const voteOnProposal = async () => {
    try {
      setIsSubmitting(true);
      setFeedbackMessage('Submitting vote...');

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi.abi, signer);

      // Encode the function data for voting
      const data = contract.interface.encodeFunctionData('voteOnProposal', [proposalId, support]);
      const relay = new GelatoRelay();

      
      // Use Gelato relay to submit the vote
      const request = {
        chainId: (await provider.getNetwork()).chainId,
        target: contractAddress,
        data: data,
        user: await signer.getAddress(),
      };

      const relayResponse = await relay.sponsoredCallERC2771(request, provider, gelatoApiKey);
      
      setFeedbackMessage('Waiting for vote confirmation...');
      
      const checkTransaction = async () => {
        try {
          const status = await relay.getTaskStatus(relayResponse.taskId);
          if (status.taskState === 'ExecSuccess') {
            setFeedbackMessage('Vote submitted successfully!');
            setProposalId('');
            setTimeout(() => {
              fetchAllProposals();
            }, 2000);
            return true;
          } else if (status.taskState === 'ExecReverted' || status.taskState === 'Cancelled') {
            setFeedbackMessage('Vote failed. Please try again.');
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error checking transaction:', error);
          return false;
        }
      };

      const pollInterval = setInterval(async () => {
        const finished = await checkTransaction();
        if (finished) {
          clearInterval(pollInterval);
          setIsSubmitting(false);
        }
      }, 2000);

    } catch (error) {
      setFeedbackMessage('Error submitting vote: ' + error.message);
      console.error(error);
      setIsSubmitting(false);
    }
  };

  // Updated fetchAllProposals function to handle BigInt values properly
  const fetchAllProposals = useCallback(async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, contractAbi.abi, provider);

      // Get the proposal count
      const count = await contract.proposalCount();
      const proposalCount = Number(count); // Convert BigInt to number
      const allProposals = [];

      // Fetch all proposals
      for (let i = 0; i < proposalCount; i++) {
        const proposal = await contract.proposals(i);
        allProposals.push({
          id: i,
          title: proposal.title,
          description: proposal.description,
          // Convert BigInt timestamp to number before multiplying
          createdAt: new Date(Number(proposal.createdAt) * 1000).toLocaleString(),
          // Convert BigInt vote counts to numbers
          votesFor: Number(proposal.votesFor),
          votesAgainst: Number(proposal.votesAgainst),
          closed: proposal.closed
        });
      }

      // Sort proposals to show newest first
      setProposals(allProposals.reverse());
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  }, [contractAddress]);

  // Set up event listeners
  useEffect(() => {
    const setupEventListeners = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(contractAddress, contractAbi.abi, provider);

        // Listen for new proposals
        contract.on("ProposalCreated", (proposalId, title, description, createdAt) => {
          console.log("New proposal created:", proposalId);
          setTimeout(() => {
            fetchAllProposals();
          }, 2000);
        });

        // Listen for new votes
        contract.on("VoteCasted", (proposalId, voter, support) => {
          console.log("New vote cast on proposal:", proposalId);
          setTimeout(() => {
            fetchAllProposals();
          }, 2000);
        });

        return () => {
          contract.removeAllListeners();
        };
      } catch (error) {
        console.error("Error setting up event listeners:", error);
      }
    };

    setupEventListeners();
  }, [contractAddress, fetchAllProposals]);

  // Initial fetch of proposals
  useEffect(() => {
    fetchAllProposals();
  }, [fetchAllProposals]);

  return (
    <div className="vote-container">
      <h3>Create Proposal</h3>
      <input
        type="text"
        value={proposalTitle}
        onChange={(e) => setProposalTitle(e.target.value)}
        placeholder="Enter Proposal Title"
        className="input-field"
      />
      <input
        type="text"
        value={proposalDescription}
        onChange={(e) => setProposalDescription(e.target.value)}
        placeholder="Enter Proposal Description"
        className="input-field"
      />
      <button 
        onClick={createProposal} 
        disabled={isSubmitting || !proposalTitle || !proposalDescription}
        className="button"
      >
        {isSubmitting ? 'Creating...' : 'Create Proposal'}
      </button>

      <h3>Vote on Proposal</h3>
      <input
        type="text"
        value={proposalId}
        onChange={(e) => setProposalId(e.target.value)}
        placeholder="Enter Proposal ID"
        className="input-field"
      />
      <div className="vote-options">
        <button 
          onClick={() => setSupport(true)} 
          className={`vote-button ${support ? 'vote-for' : 'vote-for inactive'}`}
        >
          Vote For
        </button>
        <button 
          onClick={() => setSupport(false)} 
          className={`vote-button ${!support ? 'vote-against' : 'vote-against inactive'}`}
        >
          Vote Against
        </button>
      </div>
      <button 
        onClick={voteOnProposal} 
        disabled={isSubmitting || !proposalId}
        className="button"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
      </button>

      {feedbackMessage && (
        <p className={`feedback-message ${feedbackMessage.includes('Error') ? 'error' : ''}`}>
          {feedbackMessage}
        </p>
      )}

      <div className="proposals-section">
        <h3>All Proposals</h3>
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <h4 className="proposal-title">Proposal {proposal.id}: {proposal.title}</h4>
              <p><strong>Description:</strong> {proposal.description}</p>
              <p><strong>Created:</strong> {proposal.createdAt}</p>
              <div className="proposal-stats">
                <p><strong>Votes For:</strong> {proposal.votesFor}</p>
                <p><strong>Votes Against:</strong> {proposal.votesAgainst}</p>
              </div>
              <p><strong>Status:</strong> {proposal.closed ? "Closed" : "Open"}</p>
            </div>
          ))
        ) : (
          <p>No proposals available.</p>
        )}
      </div>
    </div>
  );
};

export default Vote;