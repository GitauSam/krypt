import React, { useContext } from 'react'

import { GiCancel } from 'react-icons/gi'
import { MdError } from 'react-icons/md'
import { TransactionContext } from '../context/TransactionContext'

const Alert = () => {

    const {
        errorMessage,
        setIsError
    } = useContext(TransactionContext)

    return (
        <div className="absolute w-80 flex flex-wrap justify-between items-center white-glassmorphism top-0 right-8 text-white border border-2 border-red-300 p-2 text-red-300 rounded-sm font-semibold">
            <p className='flex items-center'>
                <MdError color='#FF0000' fontSize={30} className='mr-2'/>
                {errorMessage}
            </p>
            <GiCancel 
                color='#FF0000'
                onClick={(e) => {setIsError(false)}}
            />
        </div>
    )
}

export default Alert