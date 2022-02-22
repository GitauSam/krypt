import React, { Children, useEffect, useState } from "react"
import { ethers } from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext()

const { ethereum } = window

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)

    return transactionContract
}

export const TransactionProvider = ({ children }) => {

    const [isLoading, setIsLoading] = useState(false)
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'))
    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: ''
    })
    const [transactions, setTransactions] = useState([])
    const [isError, setIsError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState, [name]: e.target.value
        }))
    }

    const alertError = (message) => {
        setErrorMessage(message)
        setIsError(true)
    }

    const getAllTransactions = async() => {
        try {
            if (ethereum) {
                const transactionsContract = getEthereumContract()

                const availableTransactions = await transactionsContract.getAllTransactions()

                const structuredTransactions = availableTransactions.map(
                    (transaction) => ({
                        addressTo: transaction.receiver,
                        addressFrom: transaction.sender,
                        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                        message:transaction.message,
                        keyword: transaction.keyword,
                        amount: parseInt(transaction.amount._hex) / (10**18)
                    })
                )

                setTransactions(structuredTransactions)
            } else {
                alertError("Ethereum is not present")
            }
        } catch (error) {
            alertError("Ethereum is not present")
        }
    }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) {
                alertError("Please install Metamask")
                return
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' })

            if (accounts.length) {
                setCurrentAccount(accounts[0])

                getAllTransactions()
            } else {
                alertError('No accounts found')
            }
        } catch(error) {
            throw new Error("No ethereum object.")
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)
            const transactionCount = await transactionContract.getTransactionsCount()

            window.localStorage.setItem("transactionCount", transactionCount)
        } catch (error) {
            throw new Error("No ethereum object.")
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alertError("Please install Metamask")

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

            setCurrentAccount(accounts[0])
        } catch (error) {
            alertError("No ethereum object")
            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install Metamask")

            const { 
                addressTo, 
                amount, 
                keyword, 
                message 
            } = formData
            const transactionContract = getEthereumContract()
            const parsedAmount =  ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            })

            const transactionHash = await transactionContract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword
            )

            setIsLoading(true)
            await transactionHash.wait()

            setIsLoading(false)

            const transactionCount = await transactionContract.getTransactionsCount()
            setTransactionCount(transactionCount.toNumber())
            window.location.reload()

        } catch (error) {
            alertError("No ethereum object")
            throw new Error("No ethereum object.")
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected()
        checkIfTransactionsExist()
    }, [])

    return (
        <TransactionContext.Provider 
            value={{ 
                connectWallet, 
                currentAccount,
                formData,
                setFormData,
                handleChange,
                sendTransaction,
                transactions,
                isLoading,
                isError,
                errorMessage,
                setIsError
            }}
        >
            {children}
        </TransactionContext.Provider>
    )
}

