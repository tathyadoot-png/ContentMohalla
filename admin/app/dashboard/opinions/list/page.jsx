'use client'
import React, { useEffect, useState } from 'react'
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import api from '@/utils/api'

const itemsPerPage = 10

const OpinionList = () => {
  const [opinions, setOpinions] = useState([])
  const [filteredOpinions, setFilteredOpinions] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const fetchOpinions = async () => {
    try {
      const res = await api.get('/opinions')
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setOpinions(sorted)
    } catch (err) {
      console.error('Error fetching opinions', err)
      toast.error('Failed to fetch opinions')
    }
  }

  useEffect(() => {
    fetchOpinions()
  }, [])

  // Delete opinion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opinion?')) return
    try {
      await api.delete(`/opinions/${id}`)
      fetchOpinions()
      toast.success('Opinion deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete opinion')
    }
  }

  // Search filter
  useEffect(() => {
    let filtered = [...opinions]
    if (search) {
      filtered = filtered.filter(op => 
        op.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFilteredOpinions(filtered)
    setCurrentPage(1)
  }, [search, opinions])

  const totalPages = Math.ceil(filteredOpinions.length / itemsPerPage)
  const paginatedOpinions = filteredOpinions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <FaSearch /> Opinions Management
      </h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-1.5 shadow-sm flex-1"
        />
        <button
          onClick={() => router.push('/dashboard/opinions/create')}
          className="bg-primary text-white px-4 py-1.5 rounded hover:bg-blue-700"
        >
          Create Opinion
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm rounded-md overflow-hidden bg-white">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOpinions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No opinions available.
                </td>
              </tr>
            ) : (
              paginatedOpinions.map((op, idx) => (
                <tr key={op._id} className="border-b hover:bg-gray-100 transition">
                  <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-2">{op.title}</td>
                  <td className="px-4 py-2">{op.author?.name || 'Admin'}</td>
                  <td className="px-4 py-2">{op.slug}</td>
                  <td className="px-4 py-2 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => router.push(`/dashboard/opinions/edit/${op._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(op._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-1 text-sm">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 border rounded ${page === currentPage ? 'bg-primary text-white' : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default OpinionList
