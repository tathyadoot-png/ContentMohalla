'use client'
import React, { useEffect, useState, useMemo } from 'react'
import {
  FaTrash,
  FaEdit,
  FaFilter,
  FaSearch,
  FaListOl,
  FaComments,
} from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CommentsModal from '@/components/CommentsModal'
import api from '@/utils/api'
import PriorityModal from '@/components/PriorityModal'

// A reusable and beautiful Toggle Switch component for Publish/Draft
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        disabled={disabled}
      />
      <div
        className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
      ></div>
    </label>
  )
}

const NewsList = () => {
  const [newsList, setNewsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    fromDate: '',
    toDate: '',
    tag: '',
  })
  const [selectedNewsItem, setSelectedNewsItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [selectedNewsForComments, setSelectedNewsForComments] = useState(null)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)

  const itemsPerPage = 10
  const router = useRouter()

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/news')
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setNewsList(sorted)
    } catch (err) {
      console.error('Error fetching news', err)
      toast.error('Failed to fetch news')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news?')) return
    try {
      await api.delete(`/news/${id}`)
      setNewsList((prev) => prev.filter((item) => item._id !== id))
      toast.success('News deleted successfully')
    } catch (err) {
      console.error('Error deleting news', err)
      toast.error('Failed to delete news')
    }
  }

  const handleStatusToggle = async (item) => {
    setUpdatingStatusId(item._id)
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    try {
      await api.put(`/news/${item._id}/status`, { status: newStatus })
      setNewsList((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, status: newStatus } : n))
      )
      toast.success(
        `News ${
          newStatus === 'published' ? 'published' : 'moved to draft'
        } successfully`
      )
    } catch (err) {
      console.error('Error updating status', err)
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const itemDate = new Date(item.createdAt)
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null
      const toDate = filters.toDate ? new Date(filters.toDate) : null
      if (fromDate) fromDate.setHours(0, 0, 0, 0)
      if (toDate) toDate.setHours(23, 59, 59, 999)

      return (
        (!filters.search ||
          item.title.toLowerCase().includes(filters.search.toLowerCase())) &&
        (!filters.tag ||
          item.tags?.some((tag) =>
            tag.toLowerCase().includes(filters.tag.toLowerCase())
          )) &&
        (!filters.category ||
          item.categories?.some((cat) => cat.name === filters.category)) &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate)
      )
    })
  }, [filters, newsList])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getPageNumbers = (current, total) => {
    const pages = []
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      if (current <= 3) pages.push(1, 2, 3, '...', total)
      else if (current >= total - 2)
        pages.push(1, '...', total - 2, total - 1, total)
      else pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
    return pages
  }

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <FaFilter className="text-secondary" /> Published News
      </h2>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
        <input
          name="search"
          type="text"
          placeholder="Search by title..."
          value={filters.search}
          onChange={handleFilterChange}
          className="border rounded-md px-3 py-1.5 shadow-sm"
        />
        <input
          name="tag"
          type="text"
          placeholder="Filter by tag..."
          value={filters.tag}
          onChange={handleFilterChange}
          className="border rounded-md px-3 py-1.5 shadow-sm"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="border rounded-md px-3 py-1.5 shadow-sm"
        >
          <option value="">All Categories</option>
          {[
            'main-news',
            'trending-news',
            'state-news',
            'city-news',
            'desh',
            'videsh',
            'rajneeti',
            'sports',
            'education',
          ].map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </option>
          ))}
        </select>
        <input
          name="fromDate"
          type="date"
          value={filters.fromDate}
          onChange={handleFilterChange}
          className="border rounded-md px-3 py-1.5 shadow-sm"
        />
        <input
          name="toDate"
          type="date"
          value={filters.toDate}
          onChange={handleFilterChange}
          className="border rounded-md px-3 py-1.5 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm rounded-md overflow-hidden bg-white">
          <thead className="bg-primary text-white">
            <tr>
              {[
                'S.No',
                'Title',
                'Categories',
                'Priority',
                'Comments',
                'Author',
                'Tags',
                'Date',
                'Status',
                'Actions',
              ].map((header) => (
                <th key={header} className="px-4 py-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10" className="text-center py-10 text-lg">
                  Loading News...
                </td>
              </tr>
            ) : paginatedNews.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-10 text-gray-500">
                  No news found for the selected filters.
                </td>
              </tr>
            ) : (
              paginatedNews.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2 font-semibold text-gray-800">
                    {item.title}
                  </td>
                  <td className="px-4 py-2">
                    {item.categories?.map((cat) => (
                      <span
                        key={cat.name}
                        className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1 mb-1 text-xs"
                      >
                        {cat.name?.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedNewsItem(item)
                        setIsModalOpen(true)
                      }}
                      className="text-primary hover:text-secondary"
                    >
                      <FaListOl />
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedNewsForComments(item)
                        setIsCommentsModalOpen(true)
                      }}
                      className="text-primary hover:text-secondary"
                    >
                      <FaComments />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    {item.authoredBy?.name || 'Admin'}
                  </td>
                  <td className="px-4 py-2">{item.tags?.join(', ')}</td>
                  <td className="px-4 py-2">
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-2">
                    <ToggleSwitch
                      checked={item.status === 'published'}
                      onChange={() => handleStatusToggle(item)}
                      disabled={updatingStatusId === item._id}
                    />
                  </td>
                

                  <td className="px-4 py-2 text-center flex gap-3 justify-center">
                    {/* Edit */}
                    <button
                      onClick={() =>
                        router.push(`/dashboard/news/create/${item._id}`)
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>

                    {/* Publish/Draft Toggle */}
                    <button
                      onClick={async () => {
                        try {
                          const newStatus =
                            item.status === 'published' ? 'draft' : 'published'
                          await api.put(`/news/${item._id}/status`, {
                            status: newStatus,
                          })

                          // ✅ Update local state instantly
                          setNewsList((prev) =>
                            prev.map((n) =>
                              n._id === item._id
                                ? { ...n, status: newStatus }
                                : n
                            )
                          )

                          toast.success(
                            `News ${
                              newStatus === 'published'
                                ? 'published'
                                : 'moved to draft'
                            } successfully`
                          )
                        } catch (err) {
                          console.error('Error updating status', err)
                          toast.error('Failed to update status')
                        }
                      }}
                      className={`${
                        item.status === 'published'
                          ? 'text-green-600 hover:text-green-800'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {item.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item._id)}
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

      {/* Pagination (Your original code is here) */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1 text-sm">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-white hover:bg-gray-50"
          >
            Prev
          </button>
          {getPageNumbers(currentPage, totalPages).map((page, idx) =>
            page === '...' ? (
              <span key={idx} className="px-3 py-1">
                ...
              </span>
            ) : (
              <button
                key={idx}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals and ToastContainer (Your original code is here) */}
      <ToastContainer position="top-right" autoClose={3000} />
      {selectedNewsItem && (
        <PriorityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          newsItem={selectedNewsItem}
          onSave={fetchNews}
        />
      )}
      {selectedNewsForComments && (
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          newsItem={selectedNewsForComments}
        />
      )}
    </div>
  )
}

export default NewsList
// 'use client'
// import React, { useEffect, useState } from 'react'
// import {
//   FaTrash,
//   FaEdit,
//   FaFilter,
//   FaSearch,
//   FaListOl,
//   FaComments,
// } from 'react-icons/fa'
// import { useRouter } from 'next/navigation'
// import { toast, ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import CommentsModal from '@/components/CommentsModal'
// import api from '@/utils/api'
// import PriorityModal from '@/components/PriorityModal'

// const SEPARATOR = '__SEP__'

// const NewsList = () => {
//   const [newsList, setNewsList] = useState([])
//   const [filteredNews, setFilteredNews] = useState([])
//   const [search, setSearch] = useState('')
//   const [categoryFilter, setCategoryFilter] = useState('')
//   const [fromDate, setFromDate] = useState('')
//   const [toDate, setToDate] = useState('')
//   const [tagFilter, setTagFilter] = useState('')
//   const [selectedNewsItem, setSelectedNewsItem] = useState(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   const [priorityEdits, setPriorityEdits] = useState({})
//   const [currentPage, setCurrentPage] = useState(1)

//   const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
//   const [selectedNewsForComments, setSelectedNewsForComments] = useState(null)

//   const itemsPerPage = 10
//   const router = useRouter()

//   // Fetch news
//   const fetchNews = async () => {
//     try {
//       const res = await api.get('/news')
//       // Sort by latest published first
//       const sorted = res.data.sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       )
//       setNewsList(sorted)
//     } catch (err) {
//       console.error('Error fetching news', err)
//       toast.error('Failed to fetch news')
//     }
//   }

//   // Delete news
//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this news?')) return
//     try {
//       await api.delete(`/news/${id}`)
//       fetchNews()
//       toast.success('News deleted successfully')
//     } catch (err) {
//       console.error('Error deleting news', err)
//       toast.error('Failed to delete news')
//     }
//   }

//   // Priority change handler
//   const handlePriorityChange = (fieldKey, value) => {
//     setPriorityEdits((prev) => ({
//       ...prev,
//       [fieldKey]: value,
//     }))
//   }

//   // Save priority
//   const savePriority = async (newsId, catName, secKey) => {
//     const fieldKey = `${newsId}${SEPARATOR}${catName}${SEPARATOR}${secKey}`
//     const newPriority = priorityEdits[fieldKey]

//     if (!newPriority) {
//       toast.error('Please enter a priority before saving')
//       return
//     }

//     try {
//       await api.put(`/news/${newsId}/priority`, {
//         category: catName,
//         section: secKey,
//         priority: Number(newPriority),
//       })
//       toast.success('Priority updated successfully')
//       fetchNews()
//     } catch (err) {
//       console.error('Error saving priority', err)
//       toast.error('Failed to update priority')
//     }
//   }

//   useEffect(() => {
//     fetchNews()
//   }, [])

//   // Filtering
//   useEffect(() => {
//     let filtered = [...newsList]

//     if (search) {
//       filtered = filtered.filter((item) =>
//         item.title.toLowerCase().includes(search.toLowerCase())
//       )
//     }

//     if (tagFilter) {
//       filtered = filtered.filter((item) =>
//         item.tags?.some((tag) =>
//           tag.toLowerCase().includes(tagFilter.toLowerCase())
//         )
//       )
//     }

//     if (categoryFilter) {
//       filtered = filtered.filter((item) =>
//         item.categories?.some((cat) => cat.name === categoryFilter)
//       )
//     }

//     if (fromDate) {
//       filtered = filtered.filter(
//         (item) => new Date(item.createdAt) >= new Date(fromDate)
//       )
//     }

//     if (toDate) {
//       filtered = filtered.filter(
//         (item) => new Date(item.createdAt) <= new Date(toDate)
//       )
//     }

//     setFilteredNews(filtered)
//     setCurrentPage(1)
//   }, [search, categoryFilter, fromDate, toDate, tagFilter, newsList])

//   // Pagination
//   const totalPages = Math.ceil(filteredNews.length / itemsPerPage)
//   const paginatedNews = filteredNews.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   )

//   const getPageNumbers = (current, total) => {
//     const pages = []
//     if (total <= 5) {
//       for (let i = 1; i <= total; i++) pages.push(i)
//     } else {
//       if (current <= 3) pages.push(1, 2, 3, '...', total)
//       else if (current >= total - 2)
//         pages.push(1, '...', total - 2, total - 1, total)
//       else pages.push(1, '...', current - 1, current, current + 1, '...', total)
//     }
//     return pages
//   }

//   return (
//     <div className="p-4 bg-white rounded shadow-md">
//       <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
//         <FaFilter className="text-secondary" /> Published News
//       </h2>

//       {/* Filters */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <div className="flex items-center border rounded-md px-3 py-1.5 shadow-sm">
//           <FaSearch className="mr-2 text-primary" />
//           <input
//             type="text"
//             placeholder="Search by title"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full focus:outline-none bg-transparent"
//           />
//         </div>

//         <input
//           type="date"
//           value={fromDate}
//           onChange={(e) => setFromDate(e.target.value)}
//           className="border rounded-md px-3 py-1.5 shadow-sm"
//         />
//         <input
//           type="date"
//           value={toDate}
//           onChange={(e) => setToDate(e.target.value)}
//           className="border rounded-md px-3 py-1.5 shadow-sm"
//         />

//         <select
//           value={categoryFilter}
//           onChange={(e) => setCategoryFilter(e.target.value)}
//           className="border rounded-md px-3 py-1.5 shadow-sm"
//         >
//           <option value="">All Categories</option>
//           {[
//             'main-news',
//             'trending-news',
//             'trending-mudda',
//             'state-news',
//             'city-news',
//             'madhya-pradesh',
//             'desh',
//             'videsh',
//             'rajneeti',
//             'dharm',
//             'kala',
//             'sports',
//             'education',
//             'taknik',
//             'climate',
//             'manoranjan',
//             'health',
//             'blog',
//           ].map((cat) => (
//             <option key={cat} value={cat}>
//               {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Filter by tag"
//           value={tagFilter}
//           onChange={(e) => setTagFilter(e.target.value)}
//           className="border rounded-md px-3 py-1.5 shadow-sm"
//         />
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border text-sm rounded-md overflow-hidden bg-white">
//           <thead className="bg-primary text-white">
//             <tr>
//               <th className="px-4 py-2">S.No</th>
//               <th className="px-4 py-2">Title</th>
//               {/* <th className="px-4 py-2">Slug</th> */}
//               <th className="px-4 py-2">Categories</th>
//               <th className="px-4 py-2">Priority</th>
//               <th className="px-4 py-2">Comments</th>
//               <th className="px-4 py-2">Author</th>
//               <th className="px-4 py-2">Tags</th>
//               <th className="px-4 py-2">Date</th>
//               <th className="px-4 py-2">Status</th>

//               <th className="px-4 py-2 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedNews.length === 0 ? (
//               <tr>
//                 <td colSpan="9" className="text-center py-4 text-gray-500">
//                   No news uploaded yet.
//                 </td>
//               </tr>
//             ) : (
//               paginatedNews.map((item, index) => (
//                 <tr
//                   key={item._id}
//                   className="border-b hover:bg-gray-100 transition"
//                 >
//                   <td className="px-4 py-2">
//                     {(currentPage - 1) * itemsPerPage + index + 1}
//                   </td>
//                   <td className="px-4 py-2">{item.title}</td>
//                   {/* <td className="px-4 py-2">{item.slug}</td> */}
//                   <td className="px-4 py-2">
//                     {item.categories?.map((cat) => (
//                       <span
//                         key={cat.name}
//                         className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded mr-1 mb-1 text-xs"
//                       >
//                         {cat.name?.replace(/-/g, ' ')}
//                       </span>
//                     ))}
//                   </td>
//                   <td className="px-4 py-2">
//                     <button
//                       onClick={() => {
//                         setSelectedNewsItem(item)
//                         setIsModalOpen(true)
//                       }}
//                       className="text-primary hover:text-primary"
//                     >
//                       <FaListOl />
//                     </button>
//                   </td>
//                   <td className="px-4 py-2 text-center">
//                     <button
//                       onClick={() => {
//                         setSelectedNewsForComments(item)
//                         setIsCommentsModalOpen(true)
//                       }}
//                       className="text-primary hover:text-accent"
//                     >
//                       <FaComments />
//                     </button>
//                   </td>
//                   <td className="px-4 py-2">
//                     {item.authoredBy?.name || 'Admin'}
//                   </td>
//                   <td className="px-4 py-2">{item.tags?.join(', ')}</td>
//                   <td className="px-4 py-2">
//                     {new Date(item.createdAt).toLocaleDateString()}
//                   </td>
//                   <td className="px-4 py-2">
//                     <span
//                       className={`px-2 py-1 rounded text-xs ${
//                         item.status === 'published'
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-gray-200 text-gray-600'
//                       }`}
//                     >
//                       {item.status}
//                     </span>
//                   </td>

//                   <td className="px-4 py-2 text-center flex gap-3 justify-center">
//                     {/* Edit */}
//                     <button
//                       onClick={() =>
//                         router.push(`/dashboard/news/edit/${item._id}`)
//                       }
//                       className="text-blue-600 hover:text-blue-800"
//                     >
//                       <FaEdit />
//                     </button>
//                     {/* Publish/Draft Toggle */}
//                     <button
//                       onClick={async () => {
//                         try {
//                           const newStatus =
//                             item.status === 'published' ? 'draft' : 'published'
//                           await api.put(`/news/${item._id}/status`, {
//                             status: newStatus,
//                           })

//                           // ✅ Update local state instantly
//                           setNewsList((prev) =>
//                             prev.map((n) =>
//                               n._id === item._id
//                                 ? { ...n, status: newStatus }
//                                 : n
//                             )
//                           )

//                           toast.success(
//                             `News ${
//                               newStatus === 'published'
//                                 ? 'published'
//                                 : 'moved to draft'
//                             } successfully`
//                           )
//                         } catch (err) {
//                           console.error('Error updating status', err)
//                           toast.error('Failed to update status')
//                         }
//                       }}
//                       className={`${
//                         item.status === 'published'
//                           ? 'text-green-600 hover:text-green-800'
//                           : 'text-gray-600 hover:text-gray-800'
//                       }`}
//                     >
//                       {item.status === 'published' ? 'Unpublish' : 'Publish'}
//                     </button>
//                     {/* Delete */}
//                     <button
//                       onClick={() => handleDelete(item._id)}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       <FaTrash />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="mt-6 flex justify-center gap-1 text-sm">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-2 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>
//           {getPageNumbers(currentPage, totalPages).map((page, idx) =>
//             page === '...' ? (
//               <span key={idx} className="px-1">
//                 ...
//               </span>
//             ) : (
//               <button
//                 key={idx}
//                 onClick={() => setCurrentPage(page)}
//                 className={`px-2 py-1 border rounded ${
//                   page === currentPage ? 'bg-primary text-white' : ''
//                 }`}
//               >
//                 {page}
//               </button>
//             )
//           )}
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             className="px-2 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <ToastContainer position="top-right" autoClose={3000} />

//       {selectedNewsItem && (
//         <PriorityModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           newsItem={selectedNewsItem}
//           onSave={() => fetchNews()}
//         />
//       )}
//       {selectedNewsForComments && (
//         <CommentsModal
//           isOpen={isCommentsModalOpen}
//           onClose={() => setIsCommentsModalOpen(false)}
//           newsItem={selectedNewsForComments}
//         />
//       )}
//     </div>
//   )
// }

// export default NewsList
