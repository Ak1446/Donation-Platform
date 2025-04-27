import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ethers } from 'ethers'
import logo from '../assets/logo.svg'

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    checkWalletConnection()
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAddress('')
    } else {
      setAddress(accounts[0])
      setIsConnected(true)
    }
  }

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_accounts', [])
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        // Get the provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        
        setAddress(address)
        setIsConnected(true)
      } catch (error) {
        console.error("Error connecting to MetaMask:", error)
        if (error.code === 4001) {
          alert("Please connect to MetaMask to use this DApp!")
        } else {
          alert("An error occurred while connecting to MetaMask")
        }
      }
    } else {
      alert("Please install MetaMask to use this DApp!")
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center text-xl font-bold text-primary">
            <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
            Donation DApp
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/create-campaign" className="text-gray-600 hover:text-primary">
              Create Campaign
            </Link>
            
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              {isConnected ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 