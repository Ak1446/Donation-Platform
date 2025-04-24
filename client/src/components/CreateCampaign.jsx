import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

const CreateCampaign = () => {
  const navigate = useNavigate()
  const [contract, setContract] = useState(null)
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    image: ''
  })

  // Check if MetaMask is installed
  const checkMetaMask = () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to use this application')
      return false
    }
    return true
  }

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!checkMetaMask()) return

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      setAddress(userAddress)
      setIsWalletConnected(true)
      setError('')
      
      // Initialize contract with signer
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )
      
      // Test contract connection
      try {
        await contractInstance.getCampaigns()
        setContract(contractInstance)
        console.log('Contract initialized successfully')
      } catch (error) {
        console.error('Error testing contract connection:', error)
        throw new Error('Failed to connect to contract. Please check if you are on the correct network.')
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      if (error.code === 4001) {
        setError('Please connect to MetaMask to create a campaign')
      } else if (error.message.includes('network')) {
        setError('Please switch to Base Sepolia network')
      } else {
        setError(`Failed to connect to wallet: ${error.message}`)
      }
    }
  }

  // Initialize wallet connection
  useEffect(() => {
    const init = async () => {
      if (!checkMetaMask()) return

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_accounts', [])
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const userAddress = await signer.getAddress()
          
          setAddress(userAddress)
          setIsWalletConnected(true)
          
          // Initialize contract with signer
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          )
          
          // Test contract connection
          try {
            await contractInstance.getCampaigns()
            setContract(contractInstance)
            console.log('Contract initialized successfully')
          } catch (error) {
            console.error('Error testing contract connection:', error)
            throw new Error('Failed to connect to contract. Please check if you are on the correct network.')
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
        if (error.message.includes('network')) {
          setError('Please switch to Base Sepolia network')
        }
      }
    }

    init()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setIsWalletConnected(false)
          setAddress('')
          setContract(null)
        } else {
          setAddress(accounts[0])
          setIsWalletConnected(true)
        }
      })

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [])

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value })
    setError('')
  }

  const checkIfImage = (url, callback) => {
    const img = new Image()
    img.src = url
    img.onload = () => callback(true)
    img.onerror = () => callback(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!isWalletConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!form.title.trim() || !form.description.trim() || !form.image.trim()) {
      setError('Please fill in all fields')
      return
    }

    checkIfImage(form.image, async (exists) => {
      if (!exists) {
        setError('Please provide a valid image URL')
        return
      }

      try {
        setIsLoading(true)
        console.log('Creating campaign with data:', {
          owner: address,
          title: form.title,
          description: form.description,
          image: form.image
        })

        // Check if contract is properly initialized
        if (!contract) {
          throw new Error('Contract not initialized')
        }

        // Estimate gas for the transaction
        const gasEstimate = await contract.createCampaign.estimateGas(
          address,
          form.title,
          form.description,
          form.image
        )
        console.log('Estimated gas:', gasEstimate.toString())

        // Calculate gas limit with 20% buffer
        const gasLimit = Math.floor(Number(gasEstimate) * 1.2)

        // Send the transaction with higher gas limit
        const tx = await contract.createCampaign(
          address,
          form.title,
          form.description,
          form.image,
          {
            gasLimit: gasLimit
          }
        )

        console.log('Transaction sent:', tx.hash)
        
        // Wait for transaction confirmation
        const receipt = await tx.wait()
        console.log('Transaction confirmed:', receipt)

        setSuccess(true)
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } catch (err) {
        console.error('Campaign creation failed:', err)
        
        // Handle specific error cases
        if (err.code === 'INSUFFICIENT_FUNDS') {
          setError('Insufficient funds for transaction')
        } else if (err.code === 'NETWORK_ERROR') {
          setError('Network error. Please check your connection')
        } else if (err.message.includes('user rejected')) {
          setError('Transaction was rejected by user')
        } else if (err.message.includes('nonce')) {
          setError('Transaction nonce error. Please try again')
        } else {
          setError(`Failed to create campaign: ${err.message}`)
        }
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Start a Campaign
            </h1>

            {!isWalletConnected && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 mb-4">Please connect your wallet to create a campaign</p>
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Connect Wallet
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">Campaign created successfully! Redirecting...</p>
              </div>
            )}

            {isWalletConnected && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Campaign title"
                    value={form.title}
                    onChange={(e) => handleFormFieldChange('title', e)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Tell your story"
                    value={form.description}
                    onChange={(e) => handleFormFieldChange('description', e)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.image}
                    onChange={(e) => handleFormFieldChange('image', e)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    required
                  />
                  {form.image && (
                    <div className="mt-2">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                        onError={() => setError('Invalid image URL')}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-medium text-white transition duration-200 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Campaign...
                      </span>
                    ) : (
                      'Create Campaign'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCampaign
