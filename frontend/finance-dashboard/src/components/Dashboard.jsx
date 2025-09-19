import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { SummaryCard } from './SummaryCard'
import { IncomeChart } from './IncomeChart'
import {
  Wallet,
  DollarSign,
  ClipboardCheck,
  CreditCard,
  FileText,
  BarChart2,
} from 'lucide-react'

export const Dashboard = () => {
  const [pendingInspectionCount, setPendingInspectionCount] = useState(0)
  const [loadingPending, setLoadingPending] = useState(false)
  const [pendingError, setPendingError] = useState(null)
  const navigate = useNavigate();

  const handleCardClick = (destination) => {
    if (destination === 'inspection-estimates') {
      navigate('/inspection-management');
    } else {
      // You can add more navigation logic for other cards here
      console.log(`Navigating to ${destination}`);
    }
  }

  const apiBase = process.env.REACT_APP_API_BASE || ''

  const loadPending = useCallback(async () => {
    setLoadingPending(true)
    setPendingError(null)
    try {
      const url = `${apiBase}/api/inspection-estimation/pending`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      const text = await res.text()
      let data
      try {
        data = text ? JSON.parse(text) : []
      } catch (parseErr) {
        console.warn('Non-JSON response for pending inspections', { text })
        if (text && text.includes('<!DOCTYPE html')) {
          throw new Error('Proxy/URL issue: received HTML instead of JSON')
        }
        throw new Error('Invalid JSON from server')
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (Array.isArray(data)) setPendingInspectionCount(data.length)
      else if (data && Array.isArray(data.results)) setPendingInspectionCount(data.results.length)
      else if (data && Array.isArray(data.items)) setPendingInspectionCount(data.items.length)
      else setPendingInspectionCount(0)
    } catch (e) {
      console.error('Failed to load pending inspections', e)
      setPendingInspectionCount(0)
      setPendingError(e.message)
    } finally {
      setLoadingPending(false)
    }
  }, [apiBase])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header title="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <SummaryCard
          title="Total Balance"
          value="632,000"
          icon={
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
              <Wallet size={20} />
            </div>
          }
          change="+1.29%"
          changeType="positive"
          onClick={() => handleCardClick('balance')}
        />

        <SummaryCard
          title="Total Income"
          value="632,000"
          icon={
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <DollarSign size={20} />
            </div>
          }
          change="+1.29%"
          changeType="positive"
          onClick={() => handleCardClick('income')}
        />

        <SummaryCard
          title="Inspection Estimate Generations Pendings"
          count={loadingPending ? '…' : pendingError ? 'ERR' : pendingInspectionCount}
          icon={
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <ClipboardCheck size={20} />
            </div>
          }
          onClick={() => handleCardClick('inspection-estimates')}
        />

        <SummaryCard
          title="Payment Approval Pendings"
          count={3}
          icon={
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <CreditCard size={20} />
            </div>
          }
          onClick={() => handleCardClick('payment-approvals')}
        />

        <SummaryCard
          title="Quotation Generations Pendings"
          count={3}
          icon={
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <FileText size={20} />
            </div>
          }
          onClick={() => handleCardClick('quotations')}
        />

        <SummaryCard
          title="Extra"
          count={5}
          icon={
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <BarChart2 size={20} />
            </div>
          }
          onClick={() => handleCardClick('extra')}
        />
      </div>

      <IncomeChart />
    </div>
  )
}
