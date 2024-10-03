import React from 'react'

const Loading = () => {
  return (
    <div className='h-screen w-screen bg-black bg-opacity-50 fixed flex justify-center items-center'>
      <div className='w-full max-w-72 h-40 flex flex-col items-center justify-center rounded-lg bg-white'>
        <span className='font-semibold italic mt-20'>Please wait !</span>
        <img className='w-40 -translate-y-10' src="/loading2.svg" alt="loading" />
      </div>
    </div>
  )
}

export default Loading
