import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
          }
        ],
        "internalType": "struct DonationPlatform.Campaign[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const CampaignDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [donators, setDonators] = useState([])
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [donationAmount, setDonationAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        if (!window.ethereum) {
          throw new Error('Please install MetaMask to use this application')
        }

        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        
        // Get campaign details
        const campaigns = await contract.getCampaigns()
        console.log('Campaigns:', campaigns)
        
        if (!campaigns || !campaigns[id]) {
          throw new Error('Campaign not found')
        }

        const campaignData = campaigns[id]
        console.log('Campaign data:', campaignData)

        setCampaign({
          id: id,
          owner: campaignData.owner,
          title: campaignData.title,
          description: campaignData.description,
          image: campaignData.image,
          amountCollected: campaignData.amountCollected
        })

        // Get donators
        try {
          const [donatorsList, donationsList] = await contract.getDonators(id)
          console.log('Donators:', donatorsList)
          console.log('Donations:', donationsList)
          setDonators(donatorsList)
          setDonations(donationsList)
        } catch (error) {
          console.error('Error fetching donators:', error)
          setDonators([])
          setDonations([])
        }

        // Check wallet connection
        try {
          const accounts = await provider.send('eth_accounts', [])
          if (accounts.length > 0) {
            setIsWalletConnected(true)
            setAddress(accounts[0])
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      } catch (error) {
        console.error("Error fetching campaign:", error)
        setError(error.message || "Failed to load campaign details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setIsWalletConnected(false)
          setAddress('')
        } else {
          setIsWalletConnected(true)
          setAddress(accounts[0])
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [id])

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      setIsWalletConnected(true)
      setAddress(userAddress)
      setError('')
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setError("Failed to connect wallet. Please try again.")
    }
  }

  const handleDonate = async (e) => {
    e.preventDefault()
    
    if (!isWalletConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!donationAmount || isNaN(donationAmount) || parseFloat(donationAmount) <= 0) {
      setError('Please enter a valid donation amount')
      return
    }

    try {
      setIsDonating(true)
      setError('')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const tx = await contract.donateToCampaign(id, {
        value: ethers.parseEther(donationAmount)
      })

      await tx.wait()
      
      // Refresh campaign data
      const campaigns = await contract.getCampaigns()
      const campaignData = campaigns[id]
      setCampaign({
        ...campaign,
        amountCollected: campaignData.amountCollected
      })

      // Refresh donators
      const [donatorsList, donationsList] = await contract.getDonators(id)
      setDonators(donatorsList)
      setDonations(donationsList)

      setDonationAmount('')
    } catch (error) {
      console.error("Error donating:", error)
      if (error.code === 4001) {
        setError('Transaction was rejected by user')
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        setError('Insufficient funds for donation')
      } else {
        setError(`Failed to donate: ${error.message}`)
      }
    } finally {
      setIsDonating(false)
    }
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

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Campaign not found
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {campaign.image && (
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
          <p className="text-gray-600 mb-6">{campaign.description}</p>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">Amount Collected</p>
              <p className="text-2xl font-bold text-blue-600">
                {ethers.formatEther(campaign.amountCollected)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Donations</p>
              <p className="text-2xl font-bold text-gray-900">{donators.length}</p>
            </div>
          </div>

          {!isWalletConnected ? (
            <button
              onClick={connectWallet}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Connect Wallet to Donate
            </button>
          ) : (
            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.1"
                />
              </div>
              <button
                type="submit"
                disabled={isDonating}
                className={`w-full px-4 py-2 rounded-lg text-white transition duration-200 ${
                  isDonating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isDonating ? 'Donating...' : 'Donate'}
              </button>
            </form>
          )}

          {donators.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Donations</h2>
              <div className="space-y-4">
                {donators.map((donator, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {donator.slice(0, 6)}...{donator.slice(-4)}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {ethers.formatEther(donations[index])} ETH
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails 