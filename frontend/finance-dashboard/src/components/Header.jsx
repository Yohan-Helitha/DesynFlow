import React from 'react'
import { Search } from 'lucide-react'

export const Header = ({ title }) => {
  return (
    <div className="flex justify-between items-center py-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for anything..."
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  )
}
