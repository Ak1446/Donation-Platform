import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xbb5C516D32c4B4a7df2D0B8FE209df80E8D1db0e'
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "campaigns",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amountCollected",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "image",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_image",
        "type": "string"
      }
    ],
    "name": "createCampaign",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "donateToCampaign",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCampaigns",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amountCollected",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "image",
            "type": "string"
          },
          {
            "internalType": "address[]",
            "name": "donators",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "donations",
            "type": "uint256[]"
          }
        ],
        "internalType": "struct DonationPlatform.Campaign[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getDonators",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "numberOfCampaigns",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const Home = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  // Check wallet connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          setWalletConnected(accounts && accounts.length > 0)
        } catch {
          setWalletConnected(false)
        }
      } else {
        setWalletConnected(false)
      }
    }
    checkConnection()
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection)
      return () => window.ethereum.removeListener('accountsChanged', checkConnection)
    }
  }, [])

  // Connect wallet handler
  const handleConnectWallet = async () => {
    setConnecting(true)
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this application')
        setConnecting(false)
        return
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletConnected(accounts && accounts.length > 0)
      setError('')
    } catch (err) {
      setError('Wallet connection failed.')
    }
    setConnecting(false)
  }

  // Only fetch campaigns if wallet is connected
  useEffect(() => {
    if (!walletConnected) {
      setLoading(false)
      return
    }
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        const campaigns = await contract.getCampaigns()
        const formattedCampaigns = campaigns.map((campaign, index) => ({
          id: index,
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          image: campaign.image,
          amountCollected: campaign.amountCollected,
          donators: campaign.donators,
          donations: campaign.donations
        }))
        setCampaigns(formattedCampaigns)
        setError('')
      } catch (error) {
        setError("Failed to load campaigns. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [walletConnected])

  // Listen for new campaigns
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      contract.on("CampaignCreated", () => {
        console.log("New campaign created, refreshing...")
        fetchCampaigns()
      })

      return () => {
        contract.removeAllListeners("CampaignCreated")
      }
    }
  }, [])

  // Skeleton card component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  )

  // If wallet is not connected, show welcome UI
  if (!walletConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-white">
        <div className="text-5xl mb-4">💖</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome to Donation DApp!</h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Connect your wallet to explore and support amazing causes.
        </p>
        <button
          onClick={handleConnectWallet}
          disabled={connecting}
          className={`px-8 py-3 rounded-xl text-white text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 mb-8 ${connecting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Campaigns</h1>
        <Link
          to="/create-campaign"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Create Campaign
        </Link>
      </div>
      
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No campaigns found. Be the first to create one!</p>
          <Link
            to="/create-campaign"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              to={`/campaign/${campaign.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {campaign.image && (
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{campaign.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">
                    {ethers.formatEther(campaign.amountCollected)} ETH
                  </span>
                  <span className="text-sm text-gray-500">
                    {campaign.donators.length} donations
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home 